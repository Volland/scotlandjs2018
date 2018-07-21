#! /usr/bin/env node
'use strict';

/*
*   Step 2
*   Display some texts
*/

var blessed = require('blessed');
var contrib = require('blessed-contrib');
var chalk = require('chalk');
var program = require('commander');
var twitter = require(__dirname + '/twitter.js');
var utils = require(__dirname + '/utils.js');

require('dotenv').config();

var screen = blessed.screen(
    {
        fullUnicode: true,
        smartCSR: true,
        title: 'aime ❤️'
    });

function scrollBoxOptions(label) {
    var options = boxOptions(label);
    options.scrollable = true;
    options.scrollbar = { ch: ' ', inverse: true };
    options.style.scrollbar = { bg: 'white', fg: 'white' }
    options.alwaysScroll = true;
    options.keys = true;
    options.mouse = true;
    return options;
}

function boxOptions(label) {
    return {
        label: chalk.bold(chalk.white(label)),
        tags: false,
        border: {
            type: 'line'
        },
        style: {
            fg: 'white',
            border: { fg: 'cyan' },
            hover: { border: { fg: 'green' }, }
        }
    };
}

function textboxOptions(label) {
    var options = boxOptions(label);
    options.inputOnFocus = true;
    
    return options;
}

var grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

var likedTweetsBox = grid.set(0, 0, 12, 6, blessed.box, boxOptions(' Recent Likes ❤️ '));
var consoleBox = grid.set(7, 8, 1, 4, blessed.textbox, textboxOptions(' Command ✏️ '));
var consoleBoxWindow = grid.set(8, 6, 4, 6, blessed.box, scrollBoxOptions(''));
var categoriesBox = grid.set(0, 6, 8, 2, blessed.box, boxOptions(' Categories 📝 '));
var helpBox = grid.set(0, 8, 7, 4, blessed.box, boxOptions(' ℹ️ '));

function start() {
    // Display default messages
    displayHelp();

    // Display recent tweets
    displayRecent();

    // Display categories
    displayCategories();
}

// Display a message containing available commands
// inside helpBox.
function displayHelp() {
    var helpMessage = 'aime ❤️   is a command line dashboard that lets you search & manage your Twitter likes.' +
        '\n\n' +
        chalk.bold('○ search -q <query> -u <username> -r <is_read> -c <category>') +
        '\n' +
        '  Search tweets. You can leave the parameters blank if you don\'t want to filter them.' +
        '\n\n' +
        chalk.bold('○ fetch') +
        '\n' +
        '  Fetch your liked tweets.' +
        '\n\n' +
        chalk.bold('○ mark -r <tweet_id> / mark -x <tweet_id>') +
        '\n' +
        '  Mark tweets as read/unread.' +
        '\n\n' +
        chalk.bold('○ set <tweet_id> <category_name>') +
        '\n' +
        '  Set category for a tweet. For now please use dash (-) as a replacement for space (e.g. Neural Networks becomes Neural-Networks).' +
        '\n\n' +
        'Press ' + chalk.bold('C or CTRL+C') + ' to quit, ' + chalk.bold('R or CTRL+R') +
        ' to refresh, and ' + chalk.bold('i') + ' to start writing your commands.';

    helpBox.content = helpMessage;
}

// Display a message containing available commands
// inside categoriesBox.
function displayCategories() {
    twitter.getCategories().then(function(categories) {
        if (categories.length == 0) {
            categoriesBox.content = '';
        } 
        else {
            categoriesBox.content = '○ ' + categories.join("\n○ ");
        }
        screen.render();
    });
}

// Display recently liked tweets in likedTweetsBox.
function displayRecent() {
    twitter.getRecentTweets(6).then(function(tweets) {
        if (tweets.length == 0) {
            var emptyMessage = 'Bummer, you haven\'t added any tweets yet. But don\'t worry, it\'s easy!' +
                        '\n\n' +
                        '- Configure your Twitter profile settings.' +
                        '\n\n' +
                        '- Use the command fetch to fetch your liked tweets.' +
                        '\n\n' +
                        '- Once done, press the key R and you can see the five most recent tweets you have liked here.' +
                        '\n\n';
            
            likedTweetsBox.content = emptyMessage;
        } else {
            likedTweetsBox.content = utils.formatTweets(tweets).join('\n\n');
        }
        screen.render();
    });
}

screen.key(['escape', 'q', 'C-c'], function (ch, key) {
    return process.exit(0);
});

start();

screen.render();