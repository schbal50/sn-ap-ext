// ==UserScript==
// @name         Automate Apollo.io extension
// @namespace    http://tampermonkey.net/
// @version      0.1
// @author       Schbal
// @match        https://www.linkedin.com/sales/search/*
// @match        https://www.linkedin.com/sales/lists/people/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=linkedin.com
// @grant        none
// ==/UserScript==

(function() {

    const selectors_array = [
        {
            selectors_title: "search",
            select_all_chk: '.flex.align-items-center.ph3.full-width div label',
            save_to_apollo_btn: '#linkedin-bulk-tour-save-contacts button',
            next_btn: '.artdeco-pagination__button.artdeco-pagination__button--next.artdeco-button.artdeco-button--muted.artdeco-button--icon-right.artdeco-button--1.artdeco-button--tertiary.ember-view'
        },
        {
            selectors_title: "list",
            select_all_chk: 'label.t-14.m0',
            save_to_apollo_btn: '#linkedin-bulk-tour-save-contacts button',
            next_btn: '.artdeco-pagination__button.artdeco-pagination__button--next.artdeco-button.artdeco-button--muted.artdeco-button--icon-right.artdeco-button--1.artdeco-button--tertiary.ember-view'
        }
    ]

    var stop_run = false;
    var search_list = true;
    var selected_list;
    
    var run_mode = 0;

    const sleep = ms => new Promise(r => setTimeout(r, ms));



    const set_stop = () => stop_run = true

    async function inject_selected_field_item() {
        // Open list select form
        var add_to_list_btn = await document.querySelector(".zp-button.x_zUY3r.x_n9QPr.x_MCSwB");
        await add_to_list_btn.click();

        await sleep(500)
        // set list on list seleft form
        var select_or_create_list_field = await document.querySelector('div.zp-select-main input')
        '<div class="zp-badge x_VIGG2 x_lMIn6 zp-select-badge"><div class="x_tLehu"><div class="x_Ixnwu">GRS - combined (supply, apparel)...</div></div></div>'

    }

    async function start_push_process() {
        var url = window.location.href;

        if (url.includes("https://www.linkedin.com/sales/lists/")) {
            run_mode = 1;
        } else {
            run_mode = 0;
        }

        // Disable start button
        var start_btn = document.getElementById("activate_btn");
        start_btn.disabled = true;
        // Render stop button on headerbar
        var header_menu_bar = document.querySelector(".eah-navigation-list");
        var li = document.createElement('li');
        li.setAttribute('class','eah-navigation-list__item');
        li.setAttribute('id','stop_btn_li');
        li.innerHTML += '<button id="stop_btn" class="artdeco-notification-badge ember-view primary-navigation-list-item__badge">STOP</button>'
        li.onclick = set_stop;
        await header_menu_bar.appendChild(li);

        await select_and_push_all_pages()

        start_btn.disabled = false;
        await header_menu_bar.removeChild(li);
        stop_run = false;
        return
    }

    async function select_and_push_all_pages() {
        // Click select all btn
        var select_all_chk = await document.querySelectorAll(selectors_array[run_mode].select_all_chk)[0];

        if (select_all_chk && !stop_run) {
            await select_all_chk.click()
            await sleep(5500)

            // Select save to apollo BTN
            var btn_save_to_apollo = await document.querySelector(selectors_array[run_mode].save_to_apollo_btn)
            await btn_save_to_apollo.click();
            console.log(btn_save_to_apollo)
            await sleep(4000)
        }
        else if(stop_run) return

        // Go to next page
        try {
            var next_btn = await document.querySelectorAll(selectors_array[run_mode].next_btn)[0]
            if (next_btn.disabled) return;
            await next_btn.click();
            await sleep(4000)
            await select_and_push_all_pages()
        } catch (E) {
            return
        }
    }

    setTimeout(() => {

        var header_menu_bar = document.querySelector(".eah-navigation-list");
        var li = document.createElement('li');
        li.setAttribute('class','eah-navigation-list__item');
        li.innerHTML += '<button id="activate_btn" class="artdeco-notification-badge ember-view primary-navigation-list-item__badge">PUSH TO APOLLO</button>'
        li.onclick = start_push_process;

        header_menu_bar.appendChild(li)

    }, "5000");

})();
