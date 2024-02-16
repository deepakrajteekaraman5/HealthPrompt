const vscode = require('vscode');

let eyeHealthNotification;
let breakNotification;
let hydrationNotification;
let walkNotification;
let nutritionNotification;
let timeTracker;
let doNotDisturb = false; // Initialize "Do Not Disturb" status to false

function activate(context) {
    let totalActiveTime = 0;
    let startTime = Date.now();
    const userName = process.env['USER'] || process.env['USERNAME'];

    // Create an array of healthy food options
    const healthyFoods = [
        "A green smoothie with spinach, banana, and almond milk",
        "A serving of quinoa salad with mixed vegetables",
        "A handful of walnuts",
        "A cup of steamed broccoli with a drizzle of olive oil",
        "A bowl of oatmeal topped with fresh berries and honey",
        "A sliced cucumber with hummus",
        "A piece of grilled chicken breast",
        "A serving of brown rice with stir-fried tofu and vegetables",
        "A Greek yogurt parfait with granola and sliced kiwi",
        "A baked sweet potato with a sprinkle of cinnamon",
        "A plate of sliced watermelon",
        "A bowl of mixed fruit salad",
        "A hard-boiled egg",
        "A small serving of mixed nuts and dried fruits",
        "A whole-grain wrap with lean turkey and veggies",
        "A cup of herbal tea with honey",
        "A handful of cherry tomatoes",
        "A serving of edamame",
        "A piece of whole-grain toast with avocado",
        "A plate of sliced bell peppers with hummus",
        "A bowl of lentil soup",
        "A side of sautéed spinach with garlic",
        "A piece of grilled salmon",
        "A serving of cottage cheese with pineapple chunks",
        "A cup of vegetable juice",
        "A smoothie with kale, banana, and almond milk",
        "A bowl of mixed nuts and seeds",
        "A plate of sliced oranges",
        "A serving of roasted chickpeas",
    ];

    // Function to create and start timers with the initial or updated intervals
    function startTimers() {
        const config = vscode.workspace.getConfiguration('healthPrompt');
        const eyeHealthInterval = config.get('eyeHealthInterval') * 60 * 1000;
        const breakInterval = config.get('breakInterval') * 60 * 1000;
        const hydrateInterval = config.get('hydrateInterval') * 60 * 1000;
        const walkInterval = config.get('walkInterval') * 60 * 1000;
        const nutritionInterval = config.get('nutritionInterval') * 60 * 1000;

        if (doNotDisturb) {
            // Do not disturb mode is active, so clear all notifications
            clearInterval(eyeHealthNotification);
            clearInterval(breakNotification);
            clearInterval(hydrationNotification);
            clearInterval(walkNotification);
            clearInterval(nutritionNotification);
        } else {
            // Do not disturb mode is not active, start or restart timers
            if (eyeHealthNotification) clearInterval(eyeHealthNotification);
            eyeHealthNotification = setInterval(() => {
                vscode.window.showInformationMessage(`${userName}, take a 20-second break to look at something 20 feet away.`);
            }, eyeHealthInterval);

            if (breakNotification) clearInterval(breakNotification);
            breakNotification = setInterval(() => {
                vscode.window.showInformationMessage(`${userName}, it's time for a longer break! ${getRandomActivity()}`);
            }, breakInterval);

            if (hydrationNotification) clearInterval(hydrationNotification);
            hydrationNotification = setInterval(() => {
                vscode.window.showInformationMessage(`${userName}, stay hydrated! It's time to drink some water.`);
            }, hydrateInterval);

            if (walkNotification) clearInterval(walkNotification);
            walkNotification = setInterval(() => {
                vscode.window.showInformationMessage(`${userName}, get up and take a short walk. It's good for your health.`);
            }, walkInterval);

            if (nutritionNotification) clearInterval(nutritionNotification);
            nutritionNotification = setInterval(() => {
                const randomFood = getRandomFood(healthyFoods);
                vscode.window.showInformationMessage(`${userName}, consider having ${randomFood} for a healthy snack.`);
            }, nutritionInterval);
        }
    }

    // Start timers with initial values
    startTimers();

    // Handle configuration changes
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration('healthPrompt')) {
            startTimers(); // Restart timers with new interval values
        }
    }));

    if (timeTracker) clearInterval(timeTracker);
    timeTracker = setInterval(() => {
        totalActiveTime = Date.now() - startTime;
        let totalMinutes = Math.floor(totalActiveTime / 60000);
        let totalHours = Math.floor(totalMinutes / 60);
        totalMinutes %= 60;
        vscode.window.setStatusBarMessage(`Total time in VS Code: ${totalHours}h ${totalMinutes}m.`);
    }, 10000);

    let disposable = vscode.commands.registerCommand('health-prompt.CodeWell', function () {
        vscode.window.showInformationMessage(`Hello ${userName} from Health Prompt!`);
    });

    context.subscriptions.push(disposable, {
        dispose: () => {
            clearInterval(eyeHealthNotification);
            clearInterval(breakNotification);
            clearInterval(hydrationNotification);
            clearInterval(walkNotification);
            clearInterval(nutritionNotification);
            clearInterval(timeTracker);
        }
    });

    // Create a status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = "Do Not Disturb: Off";
    statusBarItem.command = "health-prompt.toggleDoNotDisturb";
    statusBarItem.show();

    // Register a command to toggle "Do Not Disturb" status
    let toggleDoNotDisturb = vscode.commands.registerCommand('health-prompt.toggleDoNotDisturb', function () {
        doNotDisturb = !doNotDisturb;
        if (doNotDisturb) {
            statusBarItem.text = "Do Not Disturb: On";
        } else {
            statusBarItem.text = "Do Not Disturb: Off";
        }
        vscode.window.showInformationMessage(`"Do Not Disturb" is ${doNotDisturb ? 'active' : 'inactive'}.`);
    });

    context.subscriptions.push(toggleDoNotDisturb, statusBarItem);
}

function deactivate() {}

// Function to get a random activity for the break
function getRandomActivity() {
    const activities = [
        "Stand up and stretch your legs.",
        "Do a quick walk around your room or office.",
        "Do some neck and shoulder stretches.",
        "Try some wrist and hand exercises.",
        "Close your eyes and take a few deep breaths.",
        "Focus on a distant object to give your eyes a break."
    ];
    return activities[Math.floor(Math.random() * activities.length)];
}

// Function to get a random food item from the list of healthy foods
function getRandomFood(foods) {
    const randomIndex = Math.floor(Math.random() * foods.length);
    return foods[randomIndex];
}

module.exports = {
    activate,
    deactivate
};
