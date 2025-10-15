import WorkFlow from './work-flow';

async function devApp() {
    const workflow = new WorkFlow();
    workflow.forkAll();
    await workflow.dev();
}

export default devApp;
