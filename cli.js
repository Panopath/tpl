#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const yargs = require('yargs');
const changeCase = require('change-case');
const findProjectRoot = require('find-project-root');

const TEMPLATE_SAVE_PATH = path.join(findProjectRoot(process.cwd(), {
    maxDepth: 12,
    markers: ['.hg', '.git', '.idea', 'package.json', 'node_modules'],
}), "tpl_templates");

global.basename = "";
global.targetname = "";
global.cachedReplacementRules = {};

//noinspection BadExpressionStatementJS,JSLastCommaInObjectLiteral
require('yargs')
    .usage('$0 <cmd> [args]')
    .command('save [dir] [template_name]', 'save directory to template', {}, save)
    .command('gen [template_name] [dir]', 'generate directory from template', {}, gen)
    .help()
    .argv;

/*
 * {{nameCamel}}
 * {{namePascal}}
 * {{nameSnake}}
 * {{nameParam}}
 */
function getReplacementRules() {
    if (!global.cachedReplacementRules[global.basename]) {
        global.cachedReplacementRules[global.basename] = [
            {
                search: global.basename,
                replace: "{{nameCamel}}",
                changeCase: changeCase.camel,
            },
            {
                search: global.basename,
                replace: "{{namePascal}}",
                changeCase: changeCase.pascal,

            },
            {
                search: global.basename,
                replace: "{{nameSnake}}",
                changeCase: changeCase.snake,
            },
            {
                search: global.basename,
                replace: "{{nameParam}}",
                changeCase: changeCase.param,
            },
        ];
        global.cachedReplacementRules[global.basename].forEach((rule) => {
            rule.searchRegex = new RegExp(rule.changeCase(rule.search), 'g');
            rule.replaceRegex = new RegExp(rule.replace, 'g');
        });
    }
    return global.cachedReplacementRules[global.basename];
}

function toTemplate(str) {
    getReplacementRules().forEach((rule) => {
        str = str.replace(rule.searchRegex, rule.replace);
    });
    return str;
}

function fromTemplate(str) {
    getReplacementRules().forEach((rule) => {
        str = str.replace(rule.replaceRegex, rule.changeCase(global.targetname));
    });
    return str;
}

function save(argv) {
    const dir = argv["dir"];
    const template_name = argv["template_name"];
    if (!dir || !template_name)
        return;
    global.basename = path.basename(dir);
    if (!fs.existsSync(TEMPLATE_SAVE_PATH))
        fs.mkdirSync(TEMPLATE_SAVE_PATH);
    const template_dir = path.join(TEMPLATE_SAVE_PATH, template_name);
    if (fs.existsSync(template_dir)) {
        console.error(template_dir + " already exists.");
        return;
    }
    fs.mkdirSync(template_dir);
    fs.readdirSync(dir).forEach(filename => {
        fs.writeFileSync(path.join(template_dir, toTemplate(filename)), toTemplate(fs.readFileSync(path.join(dir, filename), { encoding: "UTF8" })));
    });
    console.log("Template created successfully.");
}

function gen(argv) {
    const dir = argv["dir"];
    const template_name = argv["template_name"];
    if (!dir || !template_name)
        return;
    const template_dir = path.join(TEMPLATE_SAVE_PATH, template_name);
    if (!fs.existsSync(template_dir)) {
        console.error(template_dir + " does not exist.");
        return;
    }
    if (fs.existsSync(dir)) {
        console.error(dir + " already exists.");
        return;
    }
    fs.mkdirSync(dir);
    global.targetname = path.basename(dir);
    let fileNames = fs.readdirSync(template_dir);
    fileNames.forEach(filename => {
        fs.writeFileSync(path.join(dir, fromTemplate(filename)), fromTemplate(fs.readFileSync(path.join(template_dir, filename), { encoding: "UTF8" })));
    });
    console.log("Done! Generated " + fileNames.length + " file" + (fileNames.length > 1 ? "s." : "."));
}