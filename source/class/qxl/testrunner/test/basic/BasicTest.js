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

qx.Class.define("qxl.testrunner.test.basic.BasicTest", {
  extend: qx.dev.unit.TestCase,

  include: [qx.dev.unit.MRequirementsBasic],

  members: {
    testSuccess() {
      this.assertEquals(4, 3 + 1, "This should never fail!");
      this.assertFalse(false, "Can false be true?!");
    },

    testFail() {
      this.assertTrue(false, "Well, what did you expect?");
    },

    hasNodeJs() {
      return qx.core.Environment.get("runtime.name") == "node.js";
    },

    testNodeJs() {
      this.require(["nodeJs"]);
    },
  },
});
