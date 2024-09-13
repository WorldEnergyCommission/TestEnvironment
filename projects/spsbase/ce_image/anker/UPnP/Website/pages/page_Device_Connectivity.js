(function (window) {

    // namespace
    var Page_Device_Connectivity = new (function () {

        this.Connectivity = function () {

            this.category = "Device";
            this.name = "Connectivity";
            this.subnavigationicon = "sec-nav-network.png";

            var CycleTime = 2000;
            var base = undefined;

            var IDX_NIC_NAME = 0;
            var IDX_NIC_FRIENDLYNAME = 0;
            var IDX_NIC_IPV4_ADDR = 0;
            var IDX_NIC_IPV4_SUBN = 0;
            var IDX_NIC_DHCP_ENABLED = 0;
            var IDX_NIC_IPV4_DEFAULT_GW = 0;
            var IDX_NIC_IPV4_DNSSERV = 0;
            var IDX_NIC_IPV4_DNSSERV_ACTIVE = 0;
            var IDX_TC_AMSNETID = 0;

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
                IDX_NIC_NAME = base.addParameter("NIC_Property_Name", false);
                IDX_NIC_FRIENDLYNAME = base.addParameter("NIC_Property_Friendlyname", true);
                IDX_NIC_IPV4_ADDR = base.addParameter("NIC_Property_IPv4_Address", true);
                IDX_NIC_IPV4_SUBN = base.addParameter("NIC_Property_IPv4_Subnet_Mask", true);
                IDX_NIC_DHCP_ENABLED = base.addParameter("NIC_Property_DHCP", true);
                IDX_NIC_IPV4_DEFAULT_GW = base.addParameter("NIC_Property_IPv4_Default_Gateway", true);
                IDX_NIC_IPV4_DNSSERV = base.addParameter("NIC_Property_IPv4_DnsServers", true);
                IDX_TC_AMSNETID = base.addParameter("TwinCAT_TcMisc_Property_AmsNetID", true);
                IDX_NIC_IPV4_DNSSERV_ACTIVE = base.addParameter("NIC_Property_IPv4_DnsActive", true);
                
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

                if (RequestParamIDs[IDX_NIC_NAME].getHasValues() ||
                    RequestParamIDs[IDX_NIC_IPV4_ADDR].getHasValues() ||
                    RequestParamIDs[IDX_NIC_IPV4_SUBN].getHasValues() ||
                    RequestParamIDs[IDX_NIC_DHCP_ENABLED].getHasValues()) {

                    html += '<table style="margin-bottom: 5px"><tr>';
                    html += '<td class="td_trans"><h3>Network</h3></td>';
                    html += '<td class="td_Action_trans">' + new ControlLib.SmallButton().Create("btnEditNicSettings", "configure", "Configure Network Settings") + '</td>';
                    html += '</tr></table>';

                    var Rows = Math.max(RequestParamIDs[IDX_NIC_NAME].moduleCount,
                        RequestParamIDs[IDX_NIC_IPV4_ADDR].moduleCount,
                        RequestParamIDs[IDX_NIC_IPV4_SUBN].moduleCount,
                        RequestParamIDs[IDX_NIC_DHCP_ENABLED].moduleCount);

                    for (var i = 0; i < Rows; i++) {

                        html += "<table>";

                        // Nic Name
                        if (RequestParamIDs[IDX_NIC_NAME].getHasValues()) {
                            if (RequestParamIDs[IDX_NIC_NAME].values.length > i) {
                                html += '<tr><td class="td_FirstColumn">Name</td><td><div id="' + RequestParamIDs[IDX_NIC_NAME].parameterName + i + '"></div></td></tr> ';
                            }
                        }

                        // Nic Virtual Device Name
                        if (RequestParamIDs[IDX_NIC_FRIENDLYNAME].getHasValues()) {
                            if (RequestParamIDs[IDX_NIC_FRIENDLYNAME].values.length > i) {
                                html += '<tr><td class="td_FirstColumn">Virtual Device Name</td><td><div id="' + RequestParamIDs[IDX_NIC_FRIENDLYNAME].parameterName + i + '"></div></td></tr> ';
                            }
                        }

                        // IPv4 Address
                        if (RequestParamIDs[IDX_NIC_IPV4_ADDR].getHasValues()) {
                            if (RequestParamIDs[IDX_NIC_IPV4_ADDR].values.length > i) {
                                html += '<tr><td class="td_FirstColumn">IPv4 Address</td><td><div id="' + RequestParamIDs[IDX_NIC_IPV4_ADDR].parameterName + i + '"></div></td></tr> ';
                            }
                        }

                        // IPv4 Subnetmask
                        if (RequestParamIDs[IDX_NIC_IPV4_SUBN].getHasValues()) {
                            if (RequestParamIDs[IDX_NIC_IPV4_SUBN].values.length > i) {
                                html += '<tr><td class="td_FirstColumn">IPv4 Subnet Mask</td><td><div id="' + RequestParamIDs[IDX_NIC_IPV4_SUBN].parameterName + i + '"></div></td></tr> ';
                            }
                        }

                        // DHCP on/off
                        if (RequestParamIDs[IDX_NIC_DHCP_ENABLED].getHasValues()) {
                            if (RequestParamIDs[IDX_NIC_DHCP_ENABLED].values.length > i) {
                                html += '<tr><td class="td_FirstColumn">DHCP</td><td><div id="' + RequestParamIDs[IDX_NIC_DHCP_ENABLED].parameterName + i + '"></div></td></tr> ';
                            }
                        }


                        // IPv4 Default Gateway
                        if (RequestParamIDs[IDX_NIC_IPV4_DEFAULT_GW].getHasValues()) {
                            if (RequestParamIDs[IDX_NIC_IPV4_DEFAULT_GW].values.length > i) {
                                html += '<tr><td class="td_FirstColumn">IPv4 Default Gateway</td><td><div id="' + RequestParamIDs[IDX_NIC_IPV4_DEFAULT_GW].parameterName + i + '"></div></td></tr> ';
                            }
                        }

                        if (tcbsd || tcrtos) {
                            // DNS for each adapter
                            if (RequestParamIDs[IDX_NIC_IPV4_DNSSERV_ACTIVE].getHasValues()) {
                                if (RequestParamIDs[IDX_NIC_IPV4_DNSSERV_ACTIVE].values.length > i) {
                                    html += '<tr><td class="td_FirstColumn">IPv4 DNS Active</td><td><div id="' + RequestParamIDs[IDX_NIC_IPV4_DNSSERV_ACTIVE].parameterName + i + '"></div></td></tr> ';
                                }
                            }
                        }
                        else {
                            // DNS for each adapter
                            if (RequestParamIDs[IDX_NIC_IPV4_DNSSERV].getHasValues()) {
                                if (RequestParamIDs[IDX_NIC_IPV4_DNSSERV].values.length > i) {
                                    html += '<tr><td class="td_FirstColumn">IPv4 DNS Servers</td><td><div id="' + RequestParamIDs[IDX_NIC_IPV4_DNSSERV].parameterName + i + '"></div></td></tr> ';
                                }
                            }
                        }

                        html += "</table>";
                        html += "<br>";
                    }
                }

                if (RequestParamIDs[IDX_TC_AMSNETID].getHasValues()) {    // AMS-NetID
                    html += '<table style="margin-bottom: 5px"><tr>';
                    html += '<td class="td_trans"><h3>AMS Net ID</h3></td>';
                    html += '<td class="td_Action_trans">' + new ControlLib.SmallButton().Create("btnEditAmsNetID", "configure", "Configure AMS Net ID") + '</td>';
                    html += '</tr></table>';
                    html += '<table>';
                    html += '<tr><td class="td_FirstColumn">AMS Net ID</td><td><div id="' + RequestParamIDs[IDX_TC_AMSNETID].parameterName + '"></div></td></tr> ';
                    html += '</table><br>';
                }

                html += '<div id="status"></div>';  // div for errors, etc.

                // write innerHTML of page
                base.writeActivePage(html);

                if (RequestParamIDs[IDX_NIC_NAME].getHasValues() ||         // Nic Name
                    RequestParamIDs[IDX_NIC_IPV4_ADDR].getHasValues() ||    // IPv4 Address
                    RequestParamIDs[IDX_NIC_IPV4_SUBN].getHasValues() ||    // IPv4 Subnet Mask
                    RequestParamIDs[IDX_NIC_DHCP_ENABLED].getHasValues()) { // DHCP

                    base.setElementOnClick("btnEditNicSettings", function (_id) { return function () { ChangePageNic(_id); }; }(0));
                }

                if (RequestParamIDs[IDX_TC_AMSNETID].getHasValues()) {    // AMS-NetID
                    base.setElementOnClick("btnEditAmsNetID", function (_id) { return function () { ChangePageAmsNetId(_id); }; }(0));
                }

                return true;
            };

            var OnDisplayValues = function (RequestParamIDs) {

                // Write NIC-Information
                var Rows = Math.max(
                    RequestParamIDs[IDX_NIC_NAME].moduleCount,
                    RequestParamIDs[IDX_NIC_IPV4_ADDR].moduleCount,
                    RequestParamIDs[IDX_NIC_IPV4_SUBN].moduleCount,
                    RequestParamIDs[IDX_NIC_DHCP_ENABLED].moduleCount);

                for (var i = 0; i < Rows; i++) {

                    // Nic name
                    if (RequestParamIDs[IDX_NIC_NAME].getHasValues() && RequestParamIDs[IDX_NIC_NAME].values.length > i) {
                        base.writeElement(RequestParamIDs[IDX_NIC_NAME].parameterName + i, RequestParamIDs[IDX_NIC_NAME].values[i].data);
                    }

                    // Nic virtual device name
                    if (RequestParamIDs[IDX_NIC_FRIENDLYNAME].getHasValues() && RequestParamIDs[IDX_NIC_FRIENDLYNAME].values.length > i) {
                        base.writeElement(RequestParamIDs[IDX_NIC_FRIENDLYNAME].parameterName + i, RequestParamIDs[IDX_NIC_FRIENDLYNAME].values[i].data);
                    }

                    // IPv4 Address
                    if (RequestParamIDs[IDX_NIC_IPV4_ADDR].getHasValues() && RequestParamIDs[IDX_NIC_IPV4_ADDR].values.length > i) {
                        base.writeElement(RequestParamIDs[IDX_NIC_IPV4_ADDR].parameterName + i, RequestParamIDs[IDX_NIC_IPV4_ADDR].values[i].data);
                    }

                    // IPv4 SubnetMask
                    if (RequestParamIDs[IDX_NIC_IPV4_SUBN].getHasValues() && RequestParamIDs[IDX_NIC_IPV4_SUBN].values.length > i) {
                        base.writeElement(RequestParamIDs[IDX_NIC_IPV4_SUBN].parameterName + i, RequestParamIDs[IDX_NIC_IPV4_SUBN].values[i].data);
                    }

                    // DHCP
                    if (RequestParamIDs[IDX_NIC_DHCP_ENABLED].getHasValues() && RequestParamIDs[IDX_NIC_DHCP_ENABLED].values.length > i) {
                        base.writeElement(RequestParamIDs[IDX_NIC_DHCP_ENABLED].parameterName + i, window.Helper.getStatusString(RequestParamIDs[IDX_NIC_DHCP_ENABLED].values[i].data));
                    }

                    // IPv4 Default Gateway
                    if (RequestParamIDs[IDX_NIC_IPV4_DEFAULT_GW].getHasValues() && RequestParamIDs[IDX_NIC_IPV4_DEFAULT_GW].values.length > i) {
                        base.writeElement(RequestParamIDs[IDX_NIC_IPV4_DEFAULT_GW].parameterName + i, RequestParamIDs[IDX_NIC_IPV4_DEFAULT_GW].values[i].data);
                    }

                    if (tcbsd || tcrtos) {
                        // IPv4 DNS Servers
                        if (RequestParamIDs[IDX_NIC_IPV4_DNSSERV_ACTIVE].getHasValues() && RequestParamIDs[IDX_NIC_IPV4_DNSSERV_ACTIVE].values.length > i) {
                            base.writeElement(RequestParamIDs[IDX_NIC_IPV4_DNSSERV_ACTIVE].parameterName + i, RequestParamIDs[IDX_NIC_IPV4_DNSSERV_ACTIVE].values[i].data);
                        }
                    }
                    else {
                        // IPv4 DNS Servers
                        if (RequestParamIDs[IDX_NIC_IPV4_DNSSERV].getHasValues() && RequestParamIDs[IDX_NIC_IPV4_DNSSERV].values.length > i) {
                            base.writeElement(RequestParamIDs[IDX_NIC_IPV4_DNSSERV].parameterName + i, RequestParamIDs[IDX_NIC_IPV4_DNSSERV].values[i].data);
                         }
                    }
                }

                if (RequestParamIDs[IDX_TC_AMSNETID].getHasValues()) {    // AMS Net ID
                    base.writeElement(RequestParamIDs[IDX_TC_AMSNETID].parameterName, RequestParamIDs[IDX_TC_AMSNETID].values[0].data);
                }
            };

            var ChangePageNic = function (idx) {
                base.ChangePage("Hardware", "NIC");
            };

            var ChangePageAmsNetId = function (idx) {
                base.ChangePage("TwinCAT", "Connectivity");
            };

        };

        this.Connectivity.prototype = new window.Page_Template.Template();

    });

    window.DevMan.RegisterModule(new Page_Device_Connectivity.Connectivity(), window.DevMan.ModuleType.Website);

})(window);
