// Object: taskManager
const runningTasks: {
    [visualCheckId: string]: {
        running: boolean
    }
} = {}

/**
 * Start task new.
 * @param {string} visualCheckId - ID task.
 */
const startTask = (visualCheckId: string) => {
    runningTasks[visualCheckId] = { running: true }
}

/**
 * check task runing.
 * @param {string} visualCheckId - task id.
 * @returns {boolean} - status id.
 */
const isTaskRunning = (visualCheckId: string) => {
    return runningTasks[visualCheckId]
        ? runningTasks[visualCheckId].running
        : false
}

/**
 * Delete task.
 * @param {string} visualCheckId - visualCheckId destroy.
 */
const cancelTask = (visualCheckId: string) => {
    if (runningTasks[visualCheckId]) {
        runningTasks[visualCheckId].running = false
    }
}

/**
 * Delete task from runningTasks
 * @param {string} visualCheckId - ID task.
 */
const finishTask = (visualCheckId: string) => {
    delete runningTasks[visualCheckId]
}

const getTask = (visualCheckId: string) => {
    return runningTasks[visualCheckId]
}

module.exports = { startTask, isTaskRunning, cancelTask, finishTask, getTask }
