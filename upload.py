# /// script
# requires-python = ">=3.11"
# dependencies = [
#   "httpx",
#   "tqdm",
# ]
# ///

import argparse
import asyncio
import os
from pathlib import Path

import httpx
from tqdm.asyncio import tqdm_asyncio

BUNNY_BASE_URL = os.getenv("BUNNY_BASE_URL")
STORAGE_ZONE = os.getenv("BUNNY_STORAGE_ZONE")
ACCESS_KEY = os.getenv("BUNNY_API_KEY")
MAX_CONCURRENT = 100


def get_files(subdir: str | None = None):
    base_path = Path("site/benchmarks")
    search_path = base_path / subdir if subdir else base_path

    files = []
    for f in search_path.rglob("*"):
        if f.is_file() and not f.name.startswith("."):
            rel_path = str(f.relative_to(base_path)).replace("\\", "/")
            files.append((f, rel_path))
    return files


async def upload_file(client, sem, local_path, remote_path):
    async with sem:
        url = f"https://{BUNNY_BASE_URL}/{STORAGE_ZONE}/benchmarks/{remote_path}"
        headers = {"AccessKey": ACCESS_KEY, "Content-Type": "application/octet-stream"}

        with open(local_path, "rb") as f:
            content = f.read()

        response = await client.put(url, content=content, headers=headers)
        return response.status_code == 201


async def main():
    parser = argparse.ArgumentParser(description="Upload benchmark files to Bunny CDN")
    parser.add_argument(
        "--subdir",
        help="Subdirectory within site/benchmarks/ to upload (e.g., 'strategies')",
    )
    args = parser.parse_args()

    files = get_files(args.subdir)

    if not files:
        print("No files to upload")
        return

    print(f"Uploading {len(files)} files...")

    async with httpx.AsyncClient(timeout=60.0) as client:
        sem = asyncio.Semaphore(MAX_CONCURRENT)
        tasks = [upload_file(client, sem, local, remote) for local, remote in files]
        results = await tqdm_asyncio.gather(*tasks, desc="Uploading", unit="file")

    success = sum(results)
    print(f"Done: {success}/{len(files)} uploaded")


if __name__ == "__main__":
    asyncio.run(main())
