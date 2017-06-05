#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const yargs = require('yargs');
const changeCase = require('change-case');

//noinspection BadExpressionStatementJS,JSLastCommaInObjectLiteral
require('yargs')
    .usage('$0 <cmd> [args]')
    .command('save [dir] [template_name]', 'save directory to template', {}, save)
    .command('gen [template_name] [dir]', 'generate directory from template', {}, gen)
    .help()
    .argv;


global.basename = "";
global.targetname = "";
global.replacementRules = null;

/*
 * {{nameCamel}}
 * {{namePascal}}
 * {{nameSnake}}
 * {{nameParam}}
 */
function getReplacementRules() {
    if (!global.replacementRules) {
        global.replacementRules = [
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
        global.replacementRules.forEach((rule) => {
            rule.searchRegex = new RegExp(rule.changeCase(rule.search), 'g');
            rule.replaceRegex = new RegExp(rule.replace, 'g');
        });
    }
    return global.replacementRules;
}

function toTemplate(str) {
    getReplacementRules().forEach((rule) => {
        str = str.replace(rule.searchRegex, rule.replace);
    });
    return str;
}

function fromTemplate(str, basename) {
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
    if (!fs.existsSync("tpl_templates"))
        fs.mkdirSync("tpl_templates");
    const template_dir = path.join("tpl_templates", template_name);
    if (fs.existsSync(template_dir)) {
        console.error(template_dir + " already exists.");
        return;
    }
    fs.mkdirSync(template_dir);
    fs.readdirSync(dir).forEach(filename => {
        fs.writeFileSync(path.join(template_dir, toTemplate(filename)), toTemplate(fs.readFileSync(path.join(dir, filename), { encoding: "UTF8" })));
    })
}

function gen(argv) {
    const dir = argv["dir"];
    const template_name = argv["template_name"];
    if (!dir || !template_name)
        return;
    const template_dir = path.join("tpl_templates", template_name);
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
    console.log(template_dir, fs.readdirSync(template_dir));
    fs.readdirSync(template_dir).forEach(filename => {
        fs.writeFileSync(path.join(dir, fromTemplate(filename)), fromTemplate(fs.readFileSync(path.join(template_dir, filename), { encoding: "UTF8" })));
    })
}