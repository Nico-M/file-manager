export async function getFileSystem() {
  try {
    const response = await fetch("http://localhost:3000/api/files");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch file system:", error);
    return {};
  }
}
