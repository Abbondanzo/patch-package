import { moveSync } from "fs-extra"
import { PackageManager } from "./detectPackageManager"
import { downloadPackage } from "./downloadPackage"
import { PackageDetails } from "./PackageDetails"
import { join } from "./path"

export function installCleanPackage({
  appPath,
  packageDetails,
  packageManager,
}: {
  appPath: string
  packageDetails: PackageDetails
  packageManager: PackageManager
}) {
  const { tmpRepo, tmpRepoPackagePath } = downloadPackage({
    appPath,
    packageDetails,
    packageManager,
  })
  const dstFolder = join(appPath, packageDetails.path)
  console.error(appPath)
  console.error(tmpRepo.name)
  console.error(tmpRepoPackagePath)
  console.error(dstFolder)
  moveSync(tmpRepoPackagePath, dstFolder, { overwrite: true })
}
