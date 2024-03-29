/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/**
 * Simple, console-only TestRunner view. Use
 * qx.core.Init.getApplication().runner.view.run() to run the test suite.
 */
qx.Class.define("qxl.testrunner.view.Console", {
  extend: qxl.testrunner.view.Abstract,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct() {
    qx.log.appender.Native;
    qx.log.appender.Console;

    if (
      !qx.core.Environment.get("qx.debug") &&
      qx.core.Environment.get("qxl.testrunner.testOrigin") == "external"
    ) {
      qx.bom.Stylesheet.createElement("%{Styles}");
    }

    // Workaround for http://bugzilla.qooxdoo.org/show_bug.cgi?id=8242
    var button = document.createElement("button");
    button.id = "run";
    var text = document.createTextNode("Run Tests");
    button.appendChild(text);
    qx.bom.Event.addNativeListener(button, "click", function () {
      qx.core.Init.getApplication().runner.view.run();
    });
    document.body.appendChild(button);
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  members: {
    __suiteResults: null,
    __iframe: null,

    /**
     * Tells the TestRunner to run all configured tests.
     */
    run() {
      this.__suiteResults = {
        startedAt: new Date().getTime(),
        finishedAt: null,
        tests: {},
      };

      this.fireEvent("runTests");
    },

    /**
     * Tells the TestRunner to stop running any pending tests.
     */
    stop() {
      this.fireEvent("stopTests");
    },

    /**
     * Writes a status message to the browser's logging console.
     *
     * @param value {String} New status value
     * @param old {String} Previous status value
     */
    _applyStatus(value, old) {
      if (!value[0] || value === old) {
        return;
      }

      this.info(value);
    },

    /**
     * Log the test suite's current status.
     * @param value {String} New testSuiteState
     * @param value {String} Previous testSuiteState
     * @param old
     */
    _applyTestSuiteState(value, old) {
      switch (value) {
        case "init":
          this.setStatus("Waiting for tests");
          break;
        case "loading":
          this.setStatus("Loading tests...");
          break;
        case "ready":
          this.setStatus(
            this.getSelectedTests().length +
              " tests ready. Call qx.core.Init.getApplication().runner.view.run() to start."
          );
          break;
        case "error":
          this.setStatus("Couldn't load test suite!");
          break;
        case "running":
          this.setStatus("Running tests...");
          break;
        case "finished":
          this.__suiteResults.finishedAt = new Date().getTime();
          this.setStatus(
            "Test suite finished. Call qx.core.Init.getApplication().runner.view.getTestResults() to get the results."
          );
          break;
        case "aborted":
          this.setStatus("Test run aborted");
          break;
      }
    },

    _applyTestModel(value, old) {
      if (!value) {
        return;
      }
      var testList = qxl.testrunner.runner.ModelUtil.getItemsByProperty(
        value,
        "type",
        "test"
      );
      this.setSelectedTests(new qx.data.Array(testList));
    },

    _applyTestCount(value, old) {},

    /**
     * Logs state changes in testResultData objects.
     *
     * @param testResultData {qxl.testrunner.unit.TestResultData} Test result data
     * object
     */
    _onTestChangeState(testResultData) {
      var testName = testResultData.getFullName();
      var state = testResultData.getState();

      var exceptions = testResultData.getExceptions();

      //Update test results map
      if (!this.__suiteResults.tests[testName]) {
        this.__suiteResults.tests[testName] = {};
      }
      this.__suiteResults.tests[testName].state = state;

      if (exceptions) {
        this.__suiteResults.tests[testName].exceptions = [];
        for (var i = 0, l = exceptions.length; i < l; i++) {
          var ex = exceptions[i].exception;
          var type = ex.classname || ex.type || "Error";

          var message = ex.toString
            ? ex.toString()
            : ex.message
            ? ex.message
            : "Unknown Error";

          var stacktrace;
          if (
            !(ex.classname && ex.classname == "qx.dev.unit.MeasurementResult")
          ) {
            stacktrace = testResultData.getStackTrace(ex);
          }

          var serializedEx = {
            type: type,
            message: message,
          };

          if (stacktrace) {
            serializedEx.stacktrace = stacktrace;
          }

          this.__suiteResults.tests[testName].exceptions.push(serializedEx);
        }
      }

      var level;
      switch (state) {
        case "skip":
          level = "warn";
          break;
        case "error":
        case "failure":
          level = "error";
          break;
        default:
          level = "info";
      }

      this[level](testName + " : " + state);

      if (state == "error" && exceptions) {
        this.error(exceptions);
      }
    },

    /**
     * Returns the results of all tests that have been executed.
     *
     * @param exceptions {Boolean} Include an array of Error objects for any
     * test with exceptions
     *
     * @return {Map} Key: The test's full name. Value: Map containing two keys:
     * state (The test's result) and (if applicable) exceptions (array of errors
     * that occured during the test's run).
     */
    getTestResults(exceptions) {
      if (!(this.__suiteResults && this.__suiteResults.tests)) {
        throw new Error("No results to get. Run the test suite first.");
      }
      if (exceptions) {
        return this.__suiteResults.tests;
      }

      var readableResults = {};
      var res = this.__suiteResults.tests;
      for (var key in res) {
        if (res.hasOwnProperty(key)) {
          readableResults[key] = { state: res[key].state };
          if (res[key].exceptions) {
            var exceptions = res[key].exceptions;
            var messages = [];
            for (var i = 0, l = exceptions.length; i < l; i++) {
              var exMap = exceptions[i];
              var message = exMap.type + ": " + exMap.message;
              if (exMap.stacktrace) {
                message += "\n" + exMap.stacktrace.split("<br>").join("\n");
              }
              messages.push(message);
            }

            readableResults[key].messages = messages;
          }
        }
      }
      return readableResults;
    },

    /**
     * Returns the aggregated results for this test suite
     *
     * @return {Map} Test suite results
     */
    getSuiteResults() {
      return this.__suiteResults;
    },

    /**
     * Returns the iframe element the AUT should be loaded in.
     *
     * @return {DOMElement} The iframe
     */
    getIframe() {
      if (!this.__iframe) {
        this.__iframe = qx.bom.Iframe.create();
        document.body.appendChild(this.__iframe);
      }

      return this.__iframe;
    },

    /**
     * (Re)Loads the AUT in the iframe.
     *
     * @param value {String} AUT URI
     * @param old {String} Previous value
     */
    _applyAutUri(value, old) {
      qx.bom.Iframe.setSource(this.getIframe(), value);
    },
  },

  destruct() {
    this._disposeMap("testResults");
    this.__iframe = null;
    delete this.__iframe;
  },
});
