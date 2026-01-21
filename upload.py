# /// script
# requires-python = ">=3.11"
# dependencies = [
#   "httpx",
#   "tqdm",
# ]
# ///

import asyncio
import os
from pathlib import Path

import httpx
from tqdm.asyncio import tqdm as async_tqdm

STORAGE_ZONE = os.getenv("BUNNY_STORAGE_ZONE")
ACCESS_KEY = os.getenv("BUNNY_API_KEY")
MAX_CONCURRENT = 100


def get_files():
    files = []
    for f in Path("site/benchmarks").rglob("*"):
        if f.is_file() and not f.name.startswith("."):
            rel_path = str(f.relative_to("site/benchmarks")).replace("\\", "/")
            files.append((f, rel_path))
    return files


async def upload_file(client, sem, local_path, remote_path):
    async with sem:
        url = f"https://storage.bunnycdn.com/{STORAGE_ZONE}/benchmarks/{remote_path}"
        headers = {"AccessKey": ACCESS_KEY, "Content-Type": "application/octet-stream"}

        with open(local_path, "rb") as f:
            content = f.read()

        response = await client.put(url, content=content, headers=headers)
        return response.status_code == 201


async def main():
    files = get_files()
    total = len(files)
    print(f"Uploading {total} files...")

    sem = asyncio.Semaphore(MAX_CONCURRENT)

    async with httpx.AsyncClient(timeout=60.0) as client:
        tasks = [upload_file(client, sem, local, remote) for local, remote in files]
        results = await async_tqdm.gather(*tasks, desc="Uploading", unit="file")

    success = sum(results)
    print(f"Done: {success}/{total} uploaded")


if __name__ == "__main__":
    asyncio.run(main())
