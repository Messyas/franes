import json
from typing import Any

from pydantic import PostgresDsn, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

from src.constants import Environment


class CustomBaseSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )


class Config(CustomBaseSettings):
    @staticmethod
    def _coerce_str_list(value: Any) -> list[str] | None:
        if value is None:
            return None
        if isinstance(value, (list, tuple, set)):
            normalized = [
                str(item).strip()
                for item in value
                if str(item).strip()
            ]
            return list(dict.fromkeys(normalized))
        if isinstance(value, str):
            raw = value.strip()
            if not raw:
                return []
            try:
                parsed = json.loads(raw)
            except ValueError:
                parsed = None
            if isinstance(parsed, list):
                normalized = [
                    str(item).strip()
                    for item in parsed
                    if str(item).strip()
                ]
                return list(dict.fromkeys(normalized))
            split_values = [
                part.strip()
                for part in raw.split(",")
                if part.strip()
            ]
            return list(dict.fromkeys(split_values))
        normalized = str(value).strip()
        return [normalized] if normalized else []

    @model_validator(mode="before")
    @classmethod
    def _normalize_list_fields(cls, data: dict[str, Any]) -> dict[str, Any]:
        if not data:
            return data

        coerced = dict(data)
        for field in ("CORS_ORIGINS", "CORS_HEADERS"):
            if field in coerced:
                normalized = cls._coerce_str_list(coerced[field])
                if normalized is not None:
                    coerced[field] = normalized
        return coerced

    DATABASE_URL: PostgresDsn
    DATABASE_ASYNC_URL: PostgresDsn
    DATABASE_POOL_SIZE: int = 16
    DATABASE_POOL_TTL: int = 60 * 20  # 20 minutes
    DATABASE_POOL_PRE_PING: bool = True

    ENVIRONMENT: Environment = Environment.PRODUCTION

    SENTRY_DSN: str | None = None

    ADMIN_TOKEN_SECRET: str = "change-me"
    ADMIN_TOKEN_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    CORS_ORIGINS: list[str] = [
        "http://localhost:3030",
        "http://localhost:3000",
        "http://127.0.0.1:3030",
        "http://127.0.0.1:3000",
    ]
    CORS_ORIGINS_REGEX: str | None = None
    CORS_HEADERS: list[str] = ["*"]

    APP_VERSION: str = "0.1"

    @model_validator(mode="after")
    def validate_sentry_non_local(self) -> "Config":
        if self.ENVIRONMENT.is_deployed and not self.SENTRY_DSN:
            raise ValueError("Sentry is not set")

        return self

    @model_validator(mode="after")
    def validate_admin_secret(self) -> "Config":
        if not self.ADMIN_TOKEN_SECRET:
            raise ValueError("Admin token secret is not set")

        return self


settings = Config()

app_configs: dict[str, Any] = {"title": "App API"}
if settings.ENVIRONMENT.is_deployed:
    app_configs["root_path"] = f"/v{settings.APP_VERSION}"

if not settings.ENVIRONMENT.is_debug:
    app_configs["openapi_url"] = None  # hide docs
