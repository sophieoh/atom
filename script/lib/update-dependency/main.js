const { makeBranch, createCommit, switchToMaster } = require('./git');
const {
  updatePackageJson,
  fetchOutdatedDependencies,
  runApmInstall
} = require('./util');

module.exports = async function() {
  // ensure we are on master
  await switchToMaster();
  const failedBumps = [];
  const successfullBumps = [];
  const outdateDependencies = await fetchOutdatedDependencies();
  const totalDependencies = outdateDependencies.reverse().length;
  for (const dependency of outdateDependencies) {
    const { found } = await makeBranch(dependency);
    if (found) {
      console.log(`Branch was found ${found}`);
      console.log('checking if a PR already exists');
      // TODO: add logic to handle existing  branch and PR
      await switchToMaster();
      continue;
    }

    await updatePackageJson(dependency);

    const failed = await runApmInstall();
    if (failed) {
      failedBumps.push({
        module: dependency.moduleName,
        reason: `couldn't install module`
      });
      continue;
    }
    await createCommit(dependency);
    // TODO: publish branch, create PR then delete local branch
    await switchToMaster();
  }

  console.log(
    `Total dependencies: ${totalDependencies} Sucessfull: ${
      successfullBumps.length
    } Failed: ${failedBumps.length}`
  );

  // TODO: log other useful information
};
