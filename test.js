async function executeSequentially() {
    const tasks = [console.log, console.log]
    c = '0'
    for (const fn of tasks) {
        c += '1'
        await fn('1' + c)
    }
}

executeSequentially()