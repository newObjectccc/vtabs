export default {
  extends: ['@commitlint/config-conventional'],
  // 添加你的规则
  rules: {
    // 'type-enum': ['build', 'chore', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style', 'test'],
  }
  // // 如果你需要忽略某个特殊的commit, 但不建议
  // // ignores: [(commit) => commit === ''],
};
