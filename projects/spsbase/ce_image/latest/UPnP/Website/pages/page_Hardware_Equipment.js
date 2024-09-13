(function (window) {

    // namespace
    var Page_Hardware_Equipment = new (function () {

        this.Equipment = function () {

            this.category = "Hardware";
            this.name = "Equipment";
            this.subnavigationicon = "sec-nav-equipment.png";

            var CycleTime = 2000;
            var base = undefined;

            var IDX_CPU_Frequency = 0;
            var IDX_CPU_Usage = 0;
            var IDX_CPU_Temperature = 0;
            var IDX_MEM_Allocated = 0;
            var IDX_MEM_Available = 0;
            var IDX_MEM_Storage_Allocated_CE = 0;
            var IDX_MEM_Storage_Available_CE = 0;
            var IDX_MEM_Division_CE = 0;
            var IDX_DISP_DeviceName = 0;
            var IDX_DISP_ActiceDisplayIdx = 0;
            var IDX_DISP_ModesArray = 0;
            var IDX_FAN_AdapterName = 0;
            var IDX_FAN_Speed = 0;
            var IDX_UPS_Model = 0;
            var IDX_UPS_VendorName = 0;
            var IDX_UPS_Version = 0;
            var IDX_UPS_Revision = 0;
            var IDX_UPS_Build = 0;
            var IDX_UPS_SerialNumber = 0;
            var IDX_UPS_PowerStatus = 0;
            var IDX_UPS_CommunicationStatus = 0;
            var IDX_UPS_BatteryStatus = 0;
            var IDX_UPS_BatteryCapacity = 0;
            var IDX_UPS_BatteryRuntime = 0;
            var IDX_UPS_PersistentPowerFailCount = 0;
            var IDX_UPS_PowerFailCounter = 0;
            var IDX_UPS_Error = 0;
            var IDX_UPS_NoBattery = 0;
            var IDX_UPS_BatteryReplaceDate = 0;
            var IDX_UPS_IntervalServiceStatus = 0;
            var IDX_UPS_GPIO_Address = 0;
            var IDX_UPS_GPIO_Offset = 0;
            var IDX_UPS_GPIO_Params = 0;
            var IDX_IO_UsState = 0;
            var IDX_IO_UsDefault = 0;
            var IDX_IO_UpState = 0;
            var IDX_IO_UpDefault = 0;

            var IoStates = ["Disabled", "Enabled"];
            

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
                IDX_CPU_Frequency = base.addParameter("CPU_Property_CPU_Frequency", false);
                IDX_CPU_Usage = base.addParameter("CPU_Property_Current_CPU_Usage", true);
                IDX_CPU_Temperature = base.addParameter("CPU_Property_Current_CPU_Temperature", true);
                if (wince) {
                    IDX_MEM_Allocated = base.addParameter("Memory_Property_Program_Memory_Allocated", true);
                    IDX_MEM_Available = base.addParameter("Memory_Property_Program_Memory_Available", true);
                }
                else {
                    IDX_MEM_Allocated = base.addParameter("Memory_Property_Program_Memory_Allocated_64", true);
                    IDX_MEM_Available = base.addParameter("Memory_Property_Program_Memory_Available_64", true);
                }
                IDX_MEM_Storage_Allocated_CE = base.addParameter("Memory_Property_Storage_Memory_Allocated_CE", true);
                IDX_MEM_Storage_Available_CE = base.addParameter("Memory_Property_Storage_Memory_Available_CE", true);
                IDX_MEM_Division_CE = base.addParameter("Memory_Property_Memory_Division", true);
                IDX_DISP_DeviceName = base.addParameter("DisplayDevice_Property_DeviceName", false);
                IDX_DISP_ActiceDisplayIdx = base.addParameter("DisplayDevice_Settings_Property_IDxActiveDisplayMode", true);
                IDX_DISP_ModesArray = base.addParameter("DisplayDevice_Modes_Property_Len", false);
                IDX_FAN_AdapterName = base.addParameter("Fan_Property_AdapterName", false);
                IDX_FAN_Speed = base.addParameter("Fan_Properties_Property_Speed", true);
                IDX_UPS_Model = base.addParameter("UPS_Information_Property_UPSModel", false);
                IDX_UPS_VendorName = base.addParameter("UPS_Information_Property_VendorName", false);
                IDX_UPS_Version = base.addParameter("UPS_Information_Property_Version", false);
                IDX_UPS_Revision = base.addParameter("UPS_Information_Property_Revision", false);
                IDX_UPS_Build = base.addParameter("UPS_Information_Property_Build", false);
                IDX_UPS_SerialNumber = base.addParameter("UPS_Information_Property_SerialNumber", false);
                IDX_UPS_PowerStatus = base.addParameter("UPS_Information_Property_PowerStatus", true);
                IDX_UPS_CommunicationStatus = base.addParameter("UPS_Information_Property_CommunicationStatus", true);
                IDX_UPS_BatteryStatus = base.addParameter("UPS_Information_Property_BatteryStatus", true);
                IDX_UPS_BatteryCapacity = base.addParameter("UPS_Information_Property_BatteryCapacity", true);
                IDX_UPS_BatteryRuntime = base.addParameter("UPS_Information_Property_BatteryRuntime", false);
                IDX_UPS_PersistentPowerFailCount = base.addParameter("UPS_Information_Property_PersistentPowerFailCount", true);
                IDX_UPS_PowerFailCounter = base.addParameter("UPS_Information_Property_PowerFailCounter", true);
                IDX_UPS_Error = base.addParameter("UPS_Information_Property_FanError", true);
                IDX_UPS_NoBattery = base.addParameter("UPS_Information_Property_NoBattery", true);
                IDX_UPS_BatteryReplaceDate = base.addParameter("UPS_Information_Property_BatteryReplaceDate", false);
                IDX_UPS_IntervalServiceStatus = base.addParameter("UPS_Information_Property_IntervalServiceStatus", true);
                IDX_UPS_GPIO_Address = base.addParameter("UPS_GPIOPinInformation_Property_Address", false);
                IDX_UPS_GPIO_Offset = base.addParameter("UPS_GPIOPinInformation_Property_Offset", false);
                IDX_UPS_GPIO_Params = base.addParameter("UPS_GPIOPinInformation_Property_Params", false);
                IDX_IO_UsState = base.addParameter("IO_Properties_UsState", true);
                IDX_IO_UsDefault = base.addParameter("IO_Properties_UsDefault", true);
                IDX_IO_UpState = base.addParameter("IO_Properties_UpState", true);
                IDX_IO_UpDefault = base.addParameter("IO_Properties_UpDefault", true);
                
                
                // init events
                base.setOnInitStaticPage(OnInitStaticPage);
                base.setOnDisplayValues(OnDisplayValues);
                base.setOnWriteFailed(OnWriteFailed);
                base.setOnWriteResult(OnWriteResult);
                //base.setOnServiceTransferFailed(OnServiceTransferFailed); not used in this page
                //base.setOnServiceTransferResult(OnServiceTransferResult); not used in this page

                return true;
            }

            var OnInitStaticPage = function (RequestParamIDs) {

                var html = "";
                
                if (RequestParamIDs[IDX_CPU_Frequency].getHasValues()) {

                    html += '<h3>CPU</h3>';
                    html += '<table>';

                    if (RequestParamIDs[IDX_CPU_Frequency].getHasValues()) {
                        html += '<tr><td class="td_FirstColumn">Frequency (MHz)</td><td><div id="' + RequestParamIDs[IDX_CPU_Frequency].parameterName + '"></div></td></tr> ';
                    }
                    
                    html += '</table>';
                    html += '<br>';
                }

                if (RequestParamIDs[IDX_CPU_Usage].getHasValues() ||
                    RequestParamIDs[IDX_CPU_Temperature].getHasValues()) {

                    html += '<div id="graphs_cpu_container" style="overflow:auto;min-width:250px;">';
                    
                    if (RequestParamIDs[IDX_CPU_Usage].getHasValues()) {

                        html += '<div id="' + RequestParamIDs[IDX_CPU_Usage].parameterName + '" style="float:left"></div>';
                    }
                    if (RequestParamIDs[IDX_CPU_Temperature].getHasValues()) {

                        html += '<div id="' + RequestParamIDs[IDX_CPU_Temperature].parameterName + '" style="float:left"></div>';
                    }
                    
                    html += '</div>';

                }

                if (wince) {

                    // Memory CE
                    if (RequestParamIDs[IDX_MEM_Allocated].getHasValues() && RequestParamIDs[IDX_MEM_Available].getHasValues() ||
                        RequestParamIDs[IDX_MEM_Storage_Allocated_CE].getHasValues() && RequestParamIDs[IDX_MEM_Storage_Available_CE].getHasValues()) {

                        html += '<h3>Memory</h3>';
                        html += '<div id="graphs_cpu_container" style="overflow:auto;min-width:250px;">';

                        // Memory CE
                        if (RequestParamIDs[IDX_MEM_Allocated].getHasValues() && RequestParamIDs[IDX_MEM_Available].getHasValues()) {  // Memory x86

                            html += '<div id="' + RequestParamIDs[IDX_MEM_Allocated].parameterName + '" style="float:left"></div>';
                        }

                        // Storage Memory CE
                        if (RequestParamIDs[IDX_MEM_Storage_Allocated_CE].getHasValues() && RequestParamIDs[IDX_MEM_Storage_Available_CE].getHasValues()) {

                            html += '<div id="' + RequestParamIDs[IDX_MEM_Storage_Allocated_CE].parameterName + '" style="float:left"></div>';
                        }

                        html += '</div>';
                    }
                }
                else {

                    // Memory Win32/Win64
                    if (RequestParamIDs[IDX_MEM_Allocated].getHasValues() && RequestParamIDs[IDX_MEM_Available].getHasValues()) {

                        html += '<h3>Memory</h3>';
                        html += '<div id="' + RequestParamIDs[IDX_MEM_Allocated].parameterName + '"></div>';
                    }
                }

                if (RequestParamIDs[IDX_MEM_Division_CE].getHasValues()) {

                    html += '<table style="margin-bottom: 5px"><tr>';
                    html += '<td class="td_trans"><h3>Memory Division</h3></td>';
                    html += '<td class="td_Action_trans">' +
                        new ControlLib.SmallButton().Create("btnWriteMemoryDivisionSettings", "save", "Save Memory division") +
                        new ControlLib.SmallButton().Create("btnWriteMemoryDivisionSettings_Cancel", "delete") + '</td>';
                    html += '</tr></table>';

                    html += '<table>';
                    html += '<tr><td class="td_FirstColumn">Memory Division (%)</td><td>' + new ControlLib.Textbox().Create(RequestParamIDs[IDX_MEM_Division_CE].parameterName) + '</td></tr> ';
                    html += '</table>';
                    html += '<br>';
                }

                if (RequestParamIDs[IDX_DISP_DeviceName].getHasValues() &&
                    RequestParamIDs[IDX_DISP_ActiceDisplayIdx].getHasValues() && RequestParamIDs[IDX_DISP_ModesArray].getHasValues()) {

                    html += '<table style="margin-bottom: 5px"><tr>';
                    html += '<td class="td_trans"><h3>Display Device</h3></td>';
                    html += '<td class="td_Action_trans">' + new ControlLib.SmallButton().Create("btnEditDispalyResolution", "configure", "Configure Display Resolutions") + '</td>';
                    html += '</tr></table>';

                    html += "<table>"
                    html += '<tr><th>Name</th><th>Resolution</th></tr>';

                    for (var i = 0; i < RequestParamIDs[IDX_DISP_DeviceName].moduleCount; i++) {
                        
                        html += '<tr>';

                        html += '<td class="td_FirstColumn"><div id="' + RequestParamIDs[IDX_DISP_DeviceName].parameterName + i + '"></div></td>';    // Name
                        html += '<td><div id="' + RequestParamIDs[IDX_DISP_ActiceDisplayIdx].parameterName + i + '"></div></td>';                           // Display Resolution

                        html += '</tr>';
                    }

                    html += '</table>';
                    html += '<br>';
                }

                // FAN                
                if (RequestParamIDs[IDX_FAN_AdapterName].getHasValues() ||
                    RequestParamIDs[IDX_FAN_Speed].getHasValues()) {

                    html += '<h3>FAN</h3>';
                    html += '<table>';

                    var Rows = Math.max(RequestParamIDs[IDX_FAN_AdapterName].moduleCount,
                                        RequestParamIDs[IDX_FAN_Speed].moduleCount);

                    for (var i = 0; i < Rows; i++) {

                        html += '<tr>';
                        html += '<td class="td_FirstColumn"><div id="' + RequestParamIDs[IDX_FAN_AdapterName].parameterName + i + '"></div></td>';
                        html += '<td><div id="' + RequestParamIDs[IDX_FAN_Speed].parameterName + i + '"></div></td>';
                        html += '</tr>';
                    }

                    html += '</table><br>';
                }

                // UPS
                if (RequestParamIDs[IDX_UPS_Model].getHasValues() ||
                    RequestParamIDs[IDX_UPS_VendorName].getHasValues() ||
                    RequestParamIDs[IDX_UPS_Version].getHasValues() ||
                    RequestParamIDs[IDX_UPS_Revision].getHasValues() ||
                    RequestParamIDs[IDX_UPS_Build].getHasValues() ||
                    RequestParamIDs[IDX_UPS_SerialNumber].getHasValues() ||
                    RequestParamIDs[IDX_UPS_PowerStatus].getHasValues() ||
                    RequestParamIDs[IDX_UPS_CommunicationStatus].getHasValues() ||
                    RequestParamIDs[IDX_UPS_BatteryStatus].getHasValues() ||
                    RequestParamIDs[IDX_UPS_BatteryCapacity].getHasValues() ||
                    RequestParamIDs[IDX_UPS_BatteryRuntime].getHasValues() ||
                    RequestParamIDs[IDX_UPS_PersistentPowerFailCount].getHasValues() ||
                    RequestParamIDs[IDX_UPS_PowerFailCounter].getHasValues() ||
                    RequestParamIDs[IDX_UPS_Error].getHasValues() ||
                    RequestParamIDs[IDX_UPS_NoBattery].getHasValues() ||
                    RequestParamIDs[IDX_UPS_BatteryReplaceDate].getHasValues() ||
                    RequestParamIDs[IDX_UPS_IntervalServiceStatus].getHasValues() ||
                    RequestParamIDs[IDX_UPS_GPIO_Address].getHasValues() ||
                    RequestParamIDs[IDX_UPS_GPIO_Offset].getHasValues()) {

                    html += '<table style="margin-bottom: 5px"><tr>';
                    html += '<td class="td_trans"><h3>UPS</h3></td>';
                    html += '<td class="td_Action_trans">' + new ControlLib.SmallButton().Create("btnTestCapacity", "power", "Test Capacity") + '</td>';
                    html += '</tr></table>';

                    html += '<table>';

                    if (RequestParamIDs[IDX_UPS_Model].getHasValues()) {
                        html += '<tr><td class="td_FirstColumn">Model</td><td><div id="' + RequestParamIDs[IDX_UPS_Model].parameterName + '"></div></td></tr> ';
                    }
                    if (RequestParamIDs[IDX_UPS_VendorName].getHasValues()) {
                        html += '<tr><td class="td_FirstColumn">Vendor name</td><td><div id="' + RequestParamIDs[IDX_UPS_VendorName].parameterName + '"></div></td></tr> ';
                    }
                    if (RequestParamIDs[IDX_UPS_Version].getHasValues()) {
                        html += '<tr><td class="td_FirstColumn">Version</td><td><div id="' + RequestParamIDs[IDX_UPS_Version].parameterName + '"></div></td></tr> ';
                    }
                    if (RequestParamIDs[IDX_UPS_Revision].getHasValues()) {
                        html += '<tr><td class="td_FirstColumn">Revision</td><td><div id="' + RequestParamIDs[IDX_UPS_Revision].parameterName + '"></div></td></tr> ';
                    }
                    if (RequestParamIDs[IDX_UPS_Build].getHasValues()) {
                        html += '<tr><td class="td_FirstColumn">Build</td><td><div id="' + RequestParamIDs[IDX_UPS_Build].parameterName + '"></div></td></tr> ';
                    }
                    if (RequestParamIDs[IDX_UPS_SerialNumber].getHasValues()) {
                        html += '<tr><td class="td_FirstColumn">Serialnumber</td><td><div id="' + RequestParamIDs[IDX_UPS_SerialNumber].parameterName + '"></div></td></tr> ';
                    }
                    if (RequestParamIDs[IDX_UPS_PowerStatus].getHasValues()) {
                        html += '<tr><td class="td_FirstColumn">Power status</td><td><div id="' + RequestParamIDs[IDX_UPS_PowerStatus].parameterName + '"></div></td></tr> ';
                    }
                    if (RequestParamIDs[IDX_UPS_CommunicationStatus].getHasValues()) {
                        html += '<tr><td class="td_FirstColumn">Communication status</td><td><div id="' + RequestParamIDs[IDX_UPS_CommunicationStatus].parameterName + '"></div></td></tr> ';
                    }
                    if (RequestParamIDs[IDX_UPS_BatteryStatus].getHasValues()) {
                        html += '<tr><td class="td_FirstColumn">Battery status</td><td><div id="' + RequestParamIDs[IDX_UPS_BatteryStatus].parameterName + '"></div></td></tr> ';
                    }
                    if (RequestParamIDs[IDX_UPS_BatteryCapacity].getHasValues()) {
                        html += '<tr><td class="td_FirstColumn">Battery capacity (%)</td><td><div id="' + RequestParamIDs[IDX_UPS_BatteryCapacity].parameterName + '"></div></td></tr> ';
                    }
                    if (RequestParamIDs[IDX_UPS_BatteryRuntime].getHasValues()) {
                        html += '<tr><td class="td_FirstColumn">Battery runtime (s)</td><td><div id="' + RequestParamIDs[IDX_UPS_BatteryRuntime].parameterName + '"></div></td></tr> ';
                    }
                    if (RequestParamIDs[IDX_UPS_PersistentPowerFailCount].getHasValues()) {
                        html += '<tr><td class="td_FirstColumn">Persistant power fail count</td><td><div id="' + RequestParamIDs[IDX_UPS_PersistentPowerFailCount].parameterName + '"></div></td></tr> ';
                    }
                    if (RequestParamIDs[IDX_UPS_PowerFailCounter].getHasValues()) {
                        html += '<tr><td class="td_FirstColumn">Power fail counter</td><td><div id="' + RequestParamIDs[IDX_UPS_PowerFailCounter].parameterName + '"></div></td></tr> ';
                    }
                    if (RequestParamIDs[IDX_UPS_Error].getHasValues()) {
                        html += '<tr><td class="td_FirstColumn">Fan Error</td><td><div id="' + RequestParamIDs[IDX_UPS_Error].parameterName + '"></div></td></tr> ';
                    }
                    if (RequestParamIDs[IDX_UPS_NoBattery].getHasValues()) {
                        html += '<tr><td class="td_FirstColumn">No battery</td><td><div id="' + RequestParamIDs[IDX_UPS_NoBattery].parameterName + '"></div></td></tr> ';
                    }
                    if (RequestParamIDs[IDX_UPS_BatteryReplaceDate].getHasValues()) {
                        html += '<tr><td class="td_FirstColumn">Battery Replace Date</td><td><div id="' + RequestParamIDs[IDX_UPS_BatteryReplaceDate].parameterName + '"></div></td></tr> ';
                    }
                    if (RequestParamIDs[IDX_UPS_IntervalServiceStatus].getHasValues()) {
                        html += '<tr><td class="td_FirstColumn">Interval Service Status</td><td><div id="' + RequestParamIDs[IDX_UPS_IntervalServiceStatus].parameterName + '"></div></td></tr> ';
                    }
                    if (RequestParamIDs[IDX_UPS_GPIO_Address].getHasValues()) {
                        html += '<tr><td class="td_FirstColumn">GPIO Pin address</td><td><div id="' + RequestParamIDs[IDX_UPS_GPIO_Address].parameterName + '"></div></td></tr> ';
                    }
                    if (RequestParamIDs[IDX_UPS_GPIO_Offset].getHasValues()) {
                        html += '<tr><td class="td_FirstColumn">GPIO Pin offset</td><td><div id="' + RequestParamIDs[IDX_UPS_GPIO_Offset].parameterName + '"></div></td></tr> ';
                    }
                    if (RequestParamIDs[IDX_UPS_GPIO_Params].getHasValues()) {
                        html += '<tr><td class="td_FirstColumn">GPIO Pin parameters</td><td><div id="' + RequestParamIDs[IDX_UPS_GPIO_Params].parameterName + '"></div></td></tr> ';
                    }

                    html += '</table>';
                    html += '<br>';
                }

                // IO
                if (RequestParamIDs[IDX_IO_UsState].getHasValues() ||
                    RequestParamIDs[IDX_IO_UsDefault].getHasValues() ||
                    RequestParamIDs[IDX_IO_UpState].getHasValues() ||
                    RequestParamIDs[IDX_IO_UpDefault].getHasValues()) {

                    html += '<table style="margin-bottom: 5px"><tr>';
                    html += '<td class="td_trans"><h3>Onboard EtherCAT P</h3></td>';
                    html += '<td class="td_Action_trans">' +
                        new ControlLib.SmallButton().Create("btnWriteIOStates", "save", "Save IO states") +
                        new ControlLib.SmallButton().Create("btnWriteIOStates_Cancel", "delete") + '</td>';
                    html += '</tr></table>';
                    
                    html += '<table>';
                    html += '<tr><td class="td_FirstColumn">Us state</td><td>' + new ControlLib.Combobox().Create(RequestParamIDs[IDX_IO_UsState].parameterName, IoStates) + '</td></tr>';
                    html += '<tr><td class="td_FirstColumn">Us default</td><td>' + new ControlLib.Combobox().Create(RequestParamIDs[IDX_IO_UsDefault].parameterName, IoStates) + '</td></tr>';
                    html += '<tr><td class="td_FirstColumn">Up state</td><td>' + new ControlLib.Combobox().Create(RequestParamIDs[IDX_IO_UpState].parameterName, IoStates) + '</td></tr>';
                    html += '<tr><td class="td_FirstColumn">Up default</td><td>' + new ControlLib.Combobox().Create(RequestParamIDs[IDX_IO_UpDefault].parameterName, IoStates) + '</td></tr>';
                    
                    html += '</table><br>';
                }

                html += '<div id="status"></div>';  // div for errors, etc.

                // write innerHTML of page
                base.writeActivePage(html);

                // Add Events
                if (RequestParamIDs[IDX_MEM_Division_CE].getHasValues()) {

                    base.addLockListener(RequestParamIDs[IDX_MEM_Division_CE].parameterName);
                    base.setElementOnClick("btnWriteMemoryDivisionSettings", function (_id) { return function () { WriteMemoryDivisionSettings(_id); }; }(0));
                    base.setElementOnClick("btnWriteMemoryDivisionSettings_Cancel", function (_id) { return function () { WriteMemoryDivisionSettings_Cancel(_id); }; }(0));

                }

                if (RequestParamIDs[IDX_DISP_DeviceName].getHasValues() &&
                    RequestParamIDs[IDX_DISP_ActiceDisplayIdx].getHasValues() && RequestParamIDs[IDX_DISP_ModesArray].getHasValues()) {

                    base.setElementOnClick("btnEditDispalyResolution", function (_id) { return function () { ChangePage(_id); }; }(0));
                }

                if (RequestParamIDs[IDX_UPS_Model].getHasValues() ||
                    RequestParamIDs[IDX_UPS_VendorName].getHasValues() ||
                    RequestParamIDs[IDX_UPS_Version].getHasValues() ||
                    RequestParamIDs[IDX_UPS_Revision].getHasValues() ||
                    RequestParamIDs[IDX_UPS_Build].getHasValues() ||
                    RequestParamIDs[IDX_UPS_SerialNumber].getHasValues() ||
                    RequestParamIDs[IDX_UPS_PowerStatus].getHasValues() ||
                    RequestParamIDs[IDX_UPS_CommunicationStatus].getHasValues() ||
                    RequestParamIDs[IDX_UPS_BatteryStatus].getHasValues() ||
                    RequestParamIDs[IDX_UPS_BatteryCapacity].getHasValues() ||
                    RequestParamIDs[IDX_UPS_BatteryRuntime].getHasValues() ||
                    RequestParamIDs[IDX_UPS_PersistentPowerFailCount].getHasValues() ||
                    RequestParamIDs[IDX_UPS_PowerFailCounter].getHasValues() ||
                    RequestParamIDs[IDX_UPS_Error].getHasValues() ||
                    RequestParamIDs[IDX_UPS_NoBattery].getHasValues() ||
                    RequestParamIDs[IDX_UPS_BatteryReplaceDate].getHasValues() ||
                    RequestParamIDs[IDX_UPS_IntervalServiceStatus].getHasValues() ||
                    RequestParamIDs[IDX_UPS_GPIO_Address].getHasValues() ||
                    RequestParamIDs[IDX_UPS_GPIO_Offset].getHasValues()) {

                    base.setElementOnClick("btnTestCapacity", function (_id) { return function () { WriteTestCapacity(_id); }; }(0));
                }

                if (RequestParamIDs[IDX_IO_UsState].getHasValues() ||
                    RequestParamIDs[IDX_IO_UsDefault].getHasValues() || 
                    RequestParamIDs[IDX_IO_UpState].getHasValues() ||
                    RequestParamIDs[IDX_IO_UpDefault].getHasValues()) {
                    
                    base.addLockListener(RequestParamIDs[IDX_IO_UsState].parameterName);
                    base.addLockListener(RequestParamIDs[IDX_IO_UsDefault].parameterName);
                    base.addLockListener(RequestParamIDs[IDX_IO_UpState].parameterName);
                    base.addLockListener(RequestParamIDs[IDX_IO_UpDefault].parameterName);

                    base.setElementOnClick("btnWriteIOStates", function (_id) { return function () { WriteIOStates(_id); }; }(0));
                    base.setElementOnClick("btnWriteIOStates_Cancel", function (_id) { return function () { WriteIOStates_Cancel(_id); }; }(0));
                }

                return true;
            }

            var OnDisplayValues = function (RequestParamIDs) {

                // Frequency
                if (RequestParamIDs[IDX_CPU_Frequency].getHasValues()) {
                    base.writeElement(RequestParamIDs[IDX_CPU_Frequency].parameterName, RequestParamIDs[IDX_CPU_Frequency].values[0].data);
                }

                // CPU-Load
                if (RequestParamIDs[IDX_CPU_Usage].getHasValues()) {

                    base.writeElement(RequestParamIDs[IDX_CPU_Usage].parameterName, new ControlLib.Bargraph().CreateDefaultBar(
                        "res/modules/cpu/kachelicons-sw-groesse-1-cpu_32.png", "Load", "%", 100, RequestParamIDs[IDX_CPU_Usage].values[0].data));
                }

                // CPU-Temperature
                if (RequestParamIDs[IDX_CPU_Temperature].getHasValues()) {
                    
                    base.writeElement(RequestParamIDs[IDX_CPU_Temperature].parameterName, new ControlLib.Bargraph().CreateDefaultBar_NoMaxDisplay(
                        "res/modules/cpu/kachelicons-sw-groesse-1-cpu_32.png", "Temperature", "°C", 100, RequestParamIDs[IDX_CPU_Temperature].values[0].data));
                }

                // Memory-Load x86 ([3] = Total memory; [4] = Available memory)
                if (RequestParamIDs[IDX_MEM_Allocated].getHasValues() &&
                    RequestParamIDs[IDX_MEM_Available].getHasValues()) {

                    var totalMemory = RequestParamIDs[IDX_MEM_Allocated].values[0].data;
                    var availableMemory = RequestParamIDs[IDX_MEM_Available].values[0].data;
                    var usedMemory = totalMemory - availableMemory;
                    base.writeElement(RequestParamIDs[IDX_MEM_Allocated].parameterName, new ControlLib.Bargraph().CreateMemoryBar("res/modules/ram/kachelicons-sw-groesse-1-ram_32.png", "RAM", totalMemory, usedMemory));                    
                }

                // Storage Memory - CE
                if (RequestParamIDs[IDX_MEM_Storage_Allocated_CE].getHasValues() &&
                    RequestParamIDs[IDX_MEM_Storage_Available_CE].getHasValues()) {

                    var totalMemory = RequestParamIDs[IDX_MEM_Storage_Allocated_CE].values[0].data;
                    var availableMemory = RequestParamIDs[IDX_MEM_Storage_Available_CE].values[0].data;
                    var usedMemory = totalMemory - availableMemory;

                    base.writeElement(RequestParamIDs[IDX_MEM_Storage_Allocated_CE].parameterName, new ControlLib.Bargraph().CreateMemoryBar("res/modules/ram/kachelicons-sw-groesse-1-ram_32.png", "Storage", totalMemory, usedMemory));
                }
                
                // Memory Division
                if (RequestParamIDs[IDX_MEM_Division_CE].getHasValues()) {
                    base.setElementValue(RequestParamIDs[IDX_MEM_Division_CE].parameterName, RequestParamIDs[IDX_MEM_Division_CE].values[0].data);
                }

                // Display resolution
                if (RequestParamIDs[IDX_DISP_DeviceName].getHasValues() &&
                    RequestParamIDs[IDX_DISP_ActiceDisplayIdx].getHasValues() && RequestParamIDs[IDX_DISP_ModesArray].getHasValues()) {

                    for (var i = 0; i < RequestParamIDs[IDX_DISP_ActiceDisplayIdx].moduleCount; i++) {

                        base.writeElement(RequestParamIDs[IDX_DISP_DeviceName].parameterName + i, RequestParamIDs[IDX_DISP_DeviceName].values[i].data);

                        var ResolutionIndex = RequestParamIDs[IDX_DISP_ActiceDisplayIdx].values[i].data;
                        ResolutionIndex--;  // zero based ResolutionIndex

                        if (ResolutionIndex >= 0 &&
                            RequestParamIDs[IDX_DISP_ModesArray].values[i].length > 0 &&
                            RequestParamIDs[IDX_DISP_ModesArray].values[i].length > ResolutionIndex) {

                            var Resolution = RequestParamIDs[IDX_DISP_ModesArray].values[i][ResolutionIndex].data;
                            base.writeElement(RequestParamIDs[IDX_DISP_ActiceDisplayIdx].parameterName + i, Resolution);
                        }
                        else {
                            // No resolution selected
                            base.writeElement(RequestParamIDs[IDX_DISP_ActiceDisplayIdx].parameterName + i, "None");
                        }

                    }

                }

                // FAN
                if (RequestParamIDs[IDX_FAN_AdapterName].getHasValues() ||
                    RequestParamIDs[IDX_FAN_Speed].getHasValues()) {

                    var Rows = Math.max(RequestParamIDs[IDX_FAN_AdapterName].moduleCount,
                                        RequestParamIDs[IDX_FAN_Speed].moduleCount);

                    for (var i = 0; i < Rows; i++) {

                        if (RequestParamIDs[IDX_FAN_AdapterName].values.length > i) {
                            base.writeElement(RequestParamIDs[IDX_FAN_AdapterName].parameterName + i, RequestParamIDs[IDX_FAN_AdapterName].values[i].getOutput() + " (rpm)");
                        }

                        if (RequestParamIDs[IDX_FAN_Speed].values.length > i) {
                            base.writeElement(RequestParamIDs[IDX_FAN_Speed].parameterName + i, RequestParamIDs[IDX_FAN_Speed].values[i].getOutput());
                        }
                    }
                }

                // UPS
                if (RequestParamIDs[IDX_UPS_Model].getHasValues()) {
                    base.writeElement(RequestParamIDs[IDX_UPS_Model].parameterName, RequestParamIDs[IDX_UPS_Model].values[0].getOutput());
                }
                if (RequestParamIDs[IDX_UPS_VendorName].getHasValues()) {
                    base.writeElement(RequestParamIDs[IDX_UPS_VendorName].parameterName, RequestParamIDs[IDX_UPS_VendorName].values[0].getOutput());
                }
                if (RequestParamIDs[IDX_UPS_Version].getHasValues()) {
                    base.writeElement(RequestParamIDs[IDX_UPS_Version].parameterName, RequestParamIDs[IDX_UPS_Version].values[0].getOutput());
                }
                if (RequestParamIDs[IDX_UPS_Revision].getHasValues()) {
                    base.writeElement(RequestParamIDs[IDX_UPS_Revision].parameterName, RequestParamIDs[IDX_UPS_Revision].values[0].getOutput());
                }
                if (RequestParamIDs[IDX_UPS_Build].getHasValues()) {
                    base.writeElement(RequestParamIDs[IDX_UPS_Build].parameterName, RequestParamIDs[IDX_UPS_Build].values[0].getOutput());
                }
                if (RequestParamIDs[IDX_UPS_SerialNumber].getHasValues()) {
                    base.writeElement(RequestParamIDs[IDX_UPS_SerialNumber].parameterName, RequestParamIDs[IDX_UPS_SerialNumber].values[0].getOutput());
                }
                if (RequestParamIDs[IDX_UPS_PowerStatus].getHasValues()) {
                    base.writeElement(RequestParamIDs[IDX_UPS_PowerStatus].parameterName, Helper.getUPSPowerStatusInfo(RequestParamIDs[IDX_UPS_PowerStatus].values[0].data));
                }
                if (RequestParamIDs[IDX_UPS_CommunicationStatus].getHasValues()) {
                    base.writeElement(RequestParamIDs[IDX_UPS_CommunicationStatus].parameterName, Helper.getUPSCommunicationStatusInfo(RequestParamIDs[IDX_UPS_CommunicationStatus].values[0].data));
                }
                if (RequestParamIDs[IDX_UPS_BatteryStatus].getHasValues()) {
                    base.writeElement(RequestParamIDs[IDX_UPS_BatteryStatus].parameterName, Helper.getUPSBatteryStatusInfo(RequestParamIDs[IDX_UPS_BatteryStatus].values[0].data));
                }
                if (RequestParamIDs[IDX_UPS_BatteryCapacity].getHasValues()) {
                    base.writeElement(RequestParamIDs[IDX_UPS_BatteryCapacity].parameterName, RequestParamIDs[IDX_UPS_BatteryCapacity].values[0].getOutput());
                }
                if (RequestParamIDs[IDX_UPS_BatteryRuntime].getHasValues()) {
                    base.writeElement(RequestParamIDs[IDX_UPS_BatteryRuntime].parameterName, RequestParamIDs[IDX_UPS_BatteryRuntime].values[0].getOutput());
                }
                if (RequestParamIDs[IDX_UPS_PersistentPowerFailCount].getHasValues()) {
                    base.writeElement(RequestParamIDs[IDX_UPS_PersistentPowerFailCount].parameterName, Helper.getBooleanToString(RequestParamIDs[IDX_UPS_PersistentPowerFailCount].values[0].data));
                }
                if (RequestParamIDs[IDX_UPS_PowerFailCounter].getHasValues()) {
                    base.writeElement(RequestParamIDs[IDX_UPS_PowerFailCounter].parameterName, RequestParamIDs[IDX_UPS_PowerFailCounter].values[0].getOutput());
                }
                if (RequestParamIDs[IDX_UPS_Error].getHasValues()) {
                    base.writeElement(RequestParamIDs[IDX_UPS_Error].parameterName, Helper.getBooleanToString(RequestParamIDs[IDX_UPS_Error].values[0].data));
                }
                if (RequestParamIDs[IDX_UPS_NoBattery].getHasValues()) {
                    base.writeElement(RequestParamIDs[IDX_UPS_NoBattery].parameterName, Helper.getBooleanToString(RequestParamIDs[IDX_UPS_NoBattery].values[0].data));
                }
                if (RequestParamIDs[IDX_UPS_BatteryReplaceDate].getHasValues()) {
                    base.writeElement(RequestParamIDs[IDX_UPS_BatteryReplaceDate].parameterName, RequestParamIDs[IDX_UPS_BatteryReplaceDate].values[0].getOutput());
                }
                if (RequestParamIDs[IDX_UPS_IntervalServiceStatus].getHasValues()) {
                    base.writeElement(RequestParamIDs[IDX_UPS_IntervalServiceStatus].parameterName, Helper.getBooleanToString(RequestParamIDs[IDX_UPS_IntervalServiceStatus].values[0].data));
                }
                if (RequestParamIDs[IDX_UPS_GPIO_Address].getHasValues()) {
                    base.writeElement(RequestParamIDs[IDX_UPS_GPIO_Address].parameterName, RequestParamIDs[IDX_UPS_GPIO_Address].values[0].getOutput());
                }
                if (RequestParamIDs[IDX_UPS_GPIO_Offset].getHasValues()) {
                    base.writeElement(RequestParamIDs[IDX_UPS_GPIO_Offset].parameterName, RequestParamIDs[IDX_UPS_GPIO_Offset].values[0].getOutput());
                }
                if (RequestParamIDs[IDX_UPS_GPIO_Params].getHasValues()) {
                    base.writeElement(RequestParamIDs[IDX_UPS_GPIO_Params].parameterName, RequestParamIDs[IDX_UPS_GPIO_Params].values[0].getOutput());
                }

                // IO
                if (RequestParamIDs[IDX_IO_UsState].getHasValues()) {
                    base.setElementValue(RequestParamIDs[IDX_IO_UsState].parameterName, RequestParamIDs[IDX_IO_UsState].values[0].data);
                }
                if (RequestParamIDs[IDX_IO_UsDefault].getHasValues()) {
                    base.setElementValue(RequestParamIDs[IDX_IO_UsDefault].parameterName, RequestParamIDs[IDX_IO_UsDefault].values[0].data);
                }
                if (RequestParamIDs[IDX_IO_UpState].getHasValues()) {
                    base.setElementValue(RequestParamIDs[IDX_IO_UpState].parameterName, RequestParamIDs[IDX_IO_UpState].values[0].data);
                }
                if (RequestParamIDs[IDX_IO_UpDefault].getHasValues()) {
                    base.setElementValue(RequestParamIDs[IDX_IO_UpDefault].parameterName, RequestParamIDs[IDX_IO_UpDefault].values[0].data);
                }
                
            }

            var ChangePage = function (idx) {
                base.ChangePage("Software", "System");
            }

            ////////////////////////////////////////////////////////////////////////////////////////////
            // Write-Requests
            /////////////////////////////////////////////////////////////////////////////////////////
            var OnWriteFailed = function (error) {

                Helper.HideLoading();
                window.DevMan.getErrorQueue().AddError(error.requestStatus, error.requestStatusText);

                base.clearLocks();
            }

            var OnWriteResult = function (ModuleItemsWritten, ErrorCodes) {

                Helper.HideLoading();

                // check for errors
                for (var i = 0; i < ModuleItemsWritten.length; i++) {
                    if (ErrorCodes[i] > 0) {
                        window.DevMan.getErrorQueue().AddError(ErrorCodes[i]);
                    }
                    else {

                        switch (ModuleItemsWritten[i].name) {

                            case "UPS_Information_Property_TestCapacity":
                                alert("Capacity-test successfully initialized.\n" +
                                      "The test will begin when you remove the power supply of the device!\n" +
                                      "\n" +
                                      "The runtime of the Battery will be stored in the property \"Battery runtime (s)\"");
                                break;
                        }
                    }
                }

                // remove Locks
                for (var i = 0; i < ModuleItemsWritten.length; i++) {
                    base.removeLock(ModuleItemsWritten[i].name);
                }
            }

            var WriteMemoryDivisionSettings = function (idx) {

                var writeParams = [];
                var idxs = [];
                var writeValues = [];

                var RequestParamIDs = base.getRequestParamIDs();

                if (base.isLocked(RequestParamIDs[IDX_MEM_Division_CE].parameterName)) {
                    writeParams.push("Memory_Property_Memory_Division");
                    idxs.push(idx);
                    writeValues.push(base.getElementValue("Memory_Property_Memory_Division"));
                }

                if (writeParams.length > 0) {
                    base.Write(writeParams, idxs, writeValues);
                    Helper.ShowLoading();
                }
            }

            var WriteMemoryDivisionSettings_Cancel = function (idx) {

                base.removeLock("Memory_Property_Memory_Division");
            }

            var WriteTestCapacity = function (idx) {

                var writeParams = [];
                var idxs = [];
                var writeValues = [];

                writeParams.push("UPS_Information_Property_TestCapacity");
                idxs.push(0);
                writeValues.push(1);
                
                base.Write(writeParams, idxs, writeValues);
                Helper.ShowLoading();
            }

            var WriteIOStates = function (idx) {

                var writeParams = [];
                var idxs = [];
                var writeValues = [];

                var RequestParamIDs = base.getRequestParamIDs();

                if (base.isLocked(RequestParamIDs[IDX_IO_UsState].parameterName)) {
                    writeParams.push(RequestParamIDs[IDX_IO_UsState].parameterName);
                    idxs.push(idx);
                    writeValues.push(base.getElementValue(RequestParamIDs[IDX_IO_UsState].parameterName));
                }

                if (base.isLocked(RequestParamIDs[IDX_IO_UsDefault].parameterName)) {
                    writeParams.push(RequestParamIDs[IDX_IO_UsDefault].parameterName);
                    idxs.push(idx);
                    writeValues.push(base.getElementValue(RequestParamIDs[IDX_IO_UsDefault].parameterName));
                }

                if (base.isLocked(RequestParamIDs[IDX_IO_UpState].parameterName)) {
                    writeParams.push(RequestParamIDs[IDX_IO_UpState].parameterName);
                    idxs.push(idx);
                    writeValues.push(base.getElementValue(RequestParamIDs[IDX_IO_UpState].parameterName));
                }

                if (base.isLocked(RequestParamIDs[IDX_IO_UpDefault].parameterName)) {
                    writeParams.push(RequestParamIDs[IDX_IO_UpDefault].parameterName);
                    idxs.push(idx);
                    writeValues.push(base.getElementValue(RequestParamIDs[IDX_IO_UpDefault].parameterName));
                }

                if (writeParams.length > 0) {
                    base.Write(writeParams, idxs, writeValues);
                    Helper.ShowLoading();
                }
            }

            var WriteIOStates_Cancel = function (idx) {

                base.removeLock("IO_Properties_UsState");
                base.removeLock("IO_Properties_UsDefault");
                base.removeLock("IO_Properties_UpState");
                base.removeLock("IO_Properties_UpDefault");
            }

        }

        this.Equipment.prototype = new window.Page_Template.Template();

    });

    window.DevMan.RegisterModule(new Page_Hardware_Equipment.Equipment(), window.DevMan.ModuleType.Website);

})(window);
