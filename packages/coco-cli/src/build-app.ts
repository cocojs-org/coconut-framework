import WorkFlow from './work-flow';

async function buildApp() {
  const workFlow = new WorkFlow();
  workFlow.forkAll();
  await workFlow.build();
  process.exit(0);
}

export default buildApp;
