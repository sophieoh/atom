const {
  makeBranch,
  createCommit,
  switchToMaster,
  publishBranch
} = require('./git');
const {
  updatePackageJson,
  fetchOutdatedDependencies,
  runApmInstall
} = require('./util');
const { createPR } = require('./pull-request');
module.exports = async function() {
  try {
    // ensure we are on master
    await switchToMaster();
    const failedBumps = [];
    const successfullBumps = [];
    const outdateDependencies = await fetchOutdatedDependencies();
    const totalDependencies = outdateDependencies.reverse().length;
    for (const dependency of outdateDependencies) {
      const { found, newBranch } = await makeBranch(dependency);
      if (found) {
        console.log(`Branch was found ${found}`);
        console.log('checking if a PR already exists');
        // TODO: add logic to handle existing  branch and PR
        await switchToMaster();
        continue;
      }

      await updatePackageJson(dependency);
      await runApmInstall();
      await createCommit(dependency);
      await publishBranch(newBranch);

      const { status } = await createPR(dependency, newBranch);
      status === 201
        ? successfullBumps.push(dependency)
        : failedBumps.push({
            module: dependency.moduleName,
            reason: `couldn't create pull request`
          });
      await switchToMaster();
    }

    console.log(
      `Total dependencies: ${totalDependencies} Sucessfull: ${
        successfullBumps.length
      } Failed: ${failedBumps.length}`
    );
    // TODO: log other useful information
  } catch (ex) {
    // TODO: handle errors
  }
};
