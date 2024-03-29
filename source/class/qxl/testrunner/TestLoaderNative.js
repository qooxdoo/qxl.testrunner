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

qx.Class.define("qxl.testrunner.TestLoaderNative", {
  extend: qx.dev.unit.TestLoaderNative,

  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics: {
    /**
     * TODOC
     *
     * @return {var} TODOC
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
    /**
     * TODOC
     *
     * @return {void}
     */
    main() {
      qxl.testrunner.TestLoader.instance = this;
      super.main();
    },
  },
});
