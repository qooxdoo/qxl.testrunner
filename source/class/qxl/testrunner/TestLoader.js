/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qxl.testrunner.TestLoader", {
  extend: qx.dev.unit.TestLoader,

  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics: {
    /**
     * Returns the TestLoader instance
     *
     * @return {qxl.testrunner.TestLoader} TestLoader instance
     */
    getInstance() {
      return this.instance;
    },
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    main() {
      qxl.testrunner.TestLoader.instance = this;
      super.main();
    },
  },
});
