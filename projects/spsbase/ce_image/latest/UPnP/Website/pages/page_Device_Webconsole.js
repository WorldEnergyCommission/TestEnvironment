(function (window) {

    // namespace
    var Page_Device_Webconsole = new (function () {

        this.Webconsole = function () {

            this.category = "Device";
            this.name = "Webconsole";
            this.subnavigationicon = "sec-nav-console.png";

            var CycleTime = 2000;
            var base = undefined;
            var consoleURL = window.location.protocol + '//' + window.location.host + "/console";

            var IDX_GENERAL_DeviceName = 0;

            this.Init = function () {

                // store context to base page
                base = this;

                if (base == undefined || base == null) {
                    return false;
                }

                // init Cycle Time for cyclic refreshing values
                base.setCycleTime(CycleTime);

                // init communication
                base.setCommunicationObj(window.DevMan.getCommunicationModule(window.DevMan.CommunicationType.mdp));

                // init parameter
                if (tcbsd)
                {
                    IDX_GENERAL_DeviceName = base.addParameter("GENERAL_Device_Name", true);
                }
                
                // init events
                base.setOnInitStaticPage(OnInitStaticPage);
                base.setOnDisplayValues(OnDisplayValues);
                //base.setOnWriteFailed(OnWriteFailed); not used in this page
                //base.setOnWriteResult(OnWriteResult); not used in this page
                //base.setOnServiceTransferFailed(OnServiceTransferFailed); not used in this page
                //base.setOnServiceTransferResult(OnServiceTransferResult); not used in this page

                return true;
            };

            var OnInitStaticPage = function (RequestParamIDs) {

                var html = "";
                html += '<table class="tableHeader"><tr>';
                html += '<td class="td_trans"><h3>Webconsole</h3></td>';
                html += '<td class="td_Action_trans">' + new ControlLib.SmallButton().Create("btnOpenInWindow", "window") + '</td>';
                html += '</tr></table>';

                html += '<iframe src="' + consoleURL + '" title="Webconsole" width="100%" height="80%"></iframe>';

                html += '<div id="status"></div>';  // div for errors, etc.

                // write innerHTML of page
                base.writeActivePage(html);

                base.setElementOnClick("btnOpenInWindow", function (_id) { return function () { OpenNewWindow(_id); }; }(0));

                return true;
            };

            var OnDisplayValues = function (RequestParamIDs) {
                // ...
            }

            var OpenNewWindow = function(idx) {
                window.open(consoleURL, "_blank");
            }

        };

        this.Webconsole.prototype = new window.Page_Template.Template();

    });

    window.DevMan.RegisterModule(new Page_Device_Webconsole.Webconsole(), window.DevMan.ModuleType.Website);

})(window);
