const { request } = require('@octokit/request');

const requestWithAuth = request.defaults({
  baseUrl: 'https://api.github.com',
  headers: {
    'user-agent': 'myApp/1.2.3',
    authorization: 'token 0d4a6af55d29c30faef4fedc9dd15e1893c3a334'
  },
  owner: 'atom',
  repo: 'atom'
});

module.exports = {
  createPR: async (
    { moduleName, isCorePackage, latest, installed },
    branch
  ) => {
    return requestWithAuth('POST /repos/:owner/:repo/pulls', {
      title: `:arrow_up:${moduleName}`,
      body: () => {
        if (!isCorePackage) {
          return `Bumps ${moduleName} from ${installed} to ${latest}`;
        }
        return `*List of changes between ${moduleName}@${installed} and ${moduleName}@${latest}: https://github.com/atom/${moduleName}/compare/v${installed}...v${latest}*`;
      },
      base: 'master',
      head: branch
    });
  },
  getPR: async branch => {
    return requestWithAuth('GET /repos/:owner/:repo/pulls', {
      head: branch,
      base: 'master'
    });
  }
};
