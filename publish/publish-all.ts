import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { publishProject } from "./publish-project";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECTS_ROOT = path.join(__dirname, "content", "projects");

async function listProjectIds() {
  const entries = await fs.readdir(PROJECTS_ROOT, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

export async function publishAllProjects() {
  const projectIds = await listProjectIds();

  if (projectIds.length === 0) {
    console.log("No project directories found under content/projects");
    return;
  }

  console.log(`Found ${projectIds.length} project(s): ${projectIds.join(", ")}`);

  for (const projectId of projectIds) {
    try {
      await publishProject(projectId);
    } catch (error) {
      console.error(`\n❌ Failed while publishing '${projectId}'`);
      throw error;
    }
  }

  console.log("\n✅ All projects published successfully");
}

const invokedPath = path.resolve(process.argv[1] ?? "");
const isCli = invokedPath === fileURLToPath(import.meta.url);

if (isCli) {
  publishAllProjects()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Publish-all failed", error);
      process.exit(1);
    });
}
