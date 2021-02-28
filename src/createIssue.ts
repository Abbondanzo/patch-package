import chalk from "chalk"
import open from "open"
import { stringify } from "querystring"
import { PackageManager } from "./detectPackageManager"
import { PackageDetails } from "./PackageDetails"
import { join, resolve } from "./path"

const repoSpecifier = /^([\w.-]+)\/([\w.-]+)$/
const githubURL = /github.com(:|\/)([\w.-]+\/[\w.-]+?)(.git|\/.*)?$/

function parseRepoString(
  repository: string,
): null | { repo: string; org: string; provider: "GitHub" } {
  if (repository.startsWith("github:")) {
    repository = repository.replace(/^github:/, "")
  }
  const urlMatch = repository.match(githubURL)
  if (urlMatch) {
    repository = urlMatch[2]
  }

  const specMatch = repository.match(repoSpecifier)

  if (!specMatch) {
    return null
  }
  const [, org, repo] = specMatch

  return { org, repo, provider: "GitHub" }
}

function getPackageVCSDetails(packageDetails: PackageDetails) {
  const repository = require(resolve(join(packageDetails.path, "package.json")))
    .repository as undefined | string | { url: string }

  if (!repository) {
    return null
  }
  if (typeof repository === "string") {
    return parseRepoString(repository)
  } else if (
    typeof repository === "object" &&
    typeof repository.url === "string"
  ) {
    return parseRepoString(repository.url)
  }
}

export function maybePrintIssueCreationPrompt(
  packageDetails: PackageDetails,
  packageManager: PackageManager,
) {
  const vcs = getPackageVCSDetails(packageDetails)
  if (vcs) {
    console.log(`💡 ${chalk.bold(packageDetails.name)} is on ${
      vcs.provider
    }! To draft an issue based on your patch run

    ${packageManager === "yarn" ? "yarn" : "npx"} patch-package ${
      packageDetails.pathSpecifier
    } --create-issue
`)
  }
}

export function openIssueCreationLink({
  packageDetails,
  patchFileContents,
}: {
  packageDetails: PackageDetails
  patchFileContents: string
}) {
  const vcs = getPackageVCSDetails(packageDetails)

  if (!vcs) {
    console.error(
      `Error: Couldn't find VCS details for ${packageDetails.pathSpecifier}`,
    )
    process.exit(1)
  }

  // trim off trailing newline since we add an extra one in the markdown block
  if (patchFileContents.endsWith("\n")) {
    patchFileContents = patchFileContents.slice(0, -1)
  }

  open(
    `https://github.com/${vcs.org}/${vcs.repo}/issues/new?${stringify({
      title: "[Replace me]",
      body: `Hi! 👋 
      
Firstly, thanks for your work on this project! 🙂

Today I used [patch-package](https://github.com/ds300/patch-package) to patch \`${packageDetails.name}\` for the project I'm working on because [Insert reason here].

Here is the diff that solved my problem:

\`\`\`diff
${patchFileContents}
\`\`\`
`,
    })}`,
  )
}
