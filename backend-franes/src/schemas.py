from datetime import datetime
from typing import Any
from zoneinfo import ZoneInfo

from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel, ConfigDict, HttpUrl


def datetime_to_gmt_str(dt: datetime) -> str:
    if not dt.tzinfo:
        dt = dt.replace(tzinfo=ZoneInfo("UTC"))

    return dt.strftime("%Y-%m-%dT%H:%M:%S%z")


class CustomModel(BaseModel):
    model_config = ConfigDict(
        json_encoders={datetime: datetime_to_gmt_str},
        populate_by_name=True,
    )

    def serializable_dict(self, **kwargs):
        """Return a dict which contains only serializable fields."""
        default_dict = self.model_dump()

        return jsonable_encoder(default_dict)


class CloudinaryAsset(BaseModel):
    public_id: str
    url: HttpUrl
    secure_url: HttpUrl | None = None
    format: str | None = None
    width: int | None = None
    height: int | None = None
    resource_type: str | None = None
    bytes: int | None = None
    folder: str | None = None
    created_at: datetime | None = None
    metadata: dict[str, Any] | None = None

    model_config = ConfigDict(extra="allow")
