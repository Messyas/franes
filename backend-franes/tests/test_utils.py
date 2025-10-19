import string

from src.utils import generate_random_alphanum


def test_generate_random_alphanum_default_length() -> None:
    token = generate_random_alphanum()

    assert len(token) == 20
    assert set(token) <= set(string.ascii_letters + string.digits)


def test_generate_random_alphanum_custom_length_and_randomness() -> None:
    length = 8
    tokens = {generate_random_alphanum(length) for _ in range(5)}

    assert all(len(token) == length for token in tokens)
    # We expect at least two distinct tokens across runs.
    assert len(tokens) > 1
