'use strict';

/* https://github.com/angular/protractor/blob/master/docs/toc.md */

describe('[Apy REST2Front]', function() {

    it('should automatically redirect to /index when location hash/fragment is empty', function() {
        browser.get('app/');
        expect(browser.getLocationAbsUrl()).toMatch("/index");
    });

    describe('[Apy-eve-demo] Jobs View Integration Tests', function() {
        beforeEach(function() {
            browser.get('app/#/jobs');
        });

        it('should render Jobs items when user navigates to /jobs', function() {
            element.all(by.css('.table tbody tr')).getSize().then(function (size) {
                expect(size.length).toBeGreaterThan(0);
            });
        });

        it('should prompt a confirmation window before deleting Jobs items when user clicks onto the `global` trash icon', function() {
            browser.findElement(by.css('i#gDelete')).click().then(function () {
                browser.switchTo().alert().dismiss();
            });
        });
    });

    describe('[Apy-eve-demo] Work Steps View Integration Tests', function() {
        beforeEach(function() {
            browser.get('app/#/work_steps');
        });

        it('should create Work step items', function() {
            element.all(by.css('.table tbody tr')).getSize().then(function (size) {
                expect(size.length).toBeGreaterThan(0);
            });
        });

        it('should render Work step items when user navigates to /work_steps', function() {
            element.all(by.css('.table tbody tr')).getSize().then(function (size) {
                expect(size.length).toBeGreaterThan(0);
            });
        });

        it('should delete all items when user clicks onto the `global` trash icon then `yes`', function() {
            browser.findElement(by.css('i#gDelete')).click();
            browser.switchTo().alert().accept();
            var asyncExec = function () {
                element.all(by.css('.table tbody tr')).getSize().then(function (size) {
                    expect(size.length).toEqual(0);
                    clearTimeout(id);
                });
            };
            //  Need to wait for all items to be deleted (async)
            var id = setTimeout(asyncExec, 1000);
        });
    });
});
