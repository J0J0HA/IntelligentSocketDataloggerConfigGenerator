// SUPPORTED DEVICES
const devices = {
    "shelly:plug-s": "Shelly Plug S",
    "shelly:3em": "Shelly 3EM"
};

const loglevelicon = {
    "debug": 'terminal',
    "info": 'info',
    "warning": 'alert-triangle',
    "error": 'x-square'
}

if (!String.prototype.padStart) {
    String.prototype.padStart = function (paddingValue) {
        return String(paddingValue + this).slice(-paddingValue.length);
    };
}


try {
    var current = JSON.parse(localStorage.getItem("1.6-config")) || {
        general: {
            log_level: "info",
            cost_calc_request_time: "00:00",
            price_kwh: 0.3
        },
        devices: {}
    }
} catch (e) {
    var current = {
        general: {
            log_level: "info",
            cost_calc_request_time: "00:00",
            price_kwh: 0.3
        },
        devices: {}
    }
}

var edit_name_no_alert = "NGGYU";

$(() => {
    $("#cost_calc_toy").datepicker({
        defaultDate: 0,
        changeYear: false,
        dateFormat: "dd.mm"
    }).focus(function() {
        //$(".ui-datepicker-year").hide()
    })


    formula.autoassign();
    formula.init();


    formula.registerButtonAction("load-config", async (self) => {
        if (!confirm("This will override your current general settings.")) return;
        const data = await $("#config-file").prop('files')[0].text();
        current.general = JSON.parse(data)["general"];
        $("#log_level").val(current.general.log_level);
        $("#cost_calc_tod").val(current.general.cost_calc_request_time_daily);
        $("#cost_calc_dom").val(current.general.cost_calc_request_time_monthly);
        $("#cost_calc_toy").val(current.general.cost_calc_request_time_yearly);
        $("#price_kwh").val(current.general.price_kwh);
        generate();
    })

    formula.registerButtonAction("load-devices", async (self) => {
        if (!confirm("This will override your current device settings.")) return;
        const data = await $("#devices-file").prop('files')[0].text();
        current.devices = JSON.parse(data);
        generate();
        list_devices();
    })

    formula.registerButtonAction("save-config", (self) => {
        saveAs(new Blob([JSON.stringify({ general: current.general })]), "isdl_config.json");
    })

    formula.registerButtonAction("save-devices", (self) => {
        saveAs(new Blob([JSON.stringify(current.devices)]), "isdl_devices.json");
    })

    formula.registerButtonAction("add-device", (self) => {
        $("#edit-name").val("New Device");
        $("#edit-type").text("shelly:plug-s");
        $("#edit-ip").val("192.168.178.200");
        $("#edit-update_time").val("30");

        formula.setOptionValue("edit-cost_calc_day", true)
        formula.setOptionValue("edit-cost_calc_month", false)
        formula.setOptionValue("edit-cost_calc_year", false)

        formula.setOptionValue("edit-poc_day", true)
        formula.setOptionValue("edit-poc_month", false)
        formula.setOptionValue("edit-poc_year", false)

        $("#edit-box").css("display", "block");
    })

    formula.registerButtonAction("edit-type-edit", (self) => {
        $("#edit-type").text(prompt("Device Type", $("#edit-type").text()) || $("#edit-type").text() || "undefined");
    })

    formula.registerButtonAction("edit-save", (self) => {
        const ename = $("#edit-name").val()
        if (ename != edit_name_no_alert && ename in current.devices) {
            return alert(`Device ${ename} already exists. Delete the original ${ename} to save or choose an unused name.`);
        }
        if (edit_name_no_alert != "NGGYU") {
            delete current.devices[edit_name_no_alert];
        }
        current.devices[ename] = {
            type: $("#edit-type").text(),
            ip: $("#edit-ip").val(),
            update_time: $("#edit-update_time").val(),
            cost_calculation: {
                daily: formula.getOptionValue("edit-cost_calc_day"),
                monthly: formula.getOptionValue("edit-cost_calc_month"),
                yearly: formula.getOptionValue("edit-cost_calc_year")
            },
            power_on_counter: {
                daily: formula.getOptionValue("edit-poc_day"),
                monthly: formula.getOptionValue("edit-poc_month"),
                yearly: formula.getOptionValue("edit-poc_year"),
                on_threshold: 2,
                off_threshold: 1
            }
        }
        $("#edit-box").css("display", "none");
        edit_name_no_alert = "NGGYU"
        console.log(generate())
        list_devices()
    })

    formula.registerButtonAction("edit-cancel", (self) => {
        $("#edit-box").css("display", "none");
        edit_name_no_alert = "NGGYU"
    })

    setInterval(() => {
        // Transfer Time
        $("[name=filltime]").text($("#cost_calc_tod").val())
        $("#selected_icon").html(feather.icons[loglevelicon[$("#log_level").val()]].toSvg())

        // Check values to be valid here!
        matchres = $("#cost_calc_tod").val().match(/^(\d\d?)\:(\d\d?)$/)
        if (!matchres || matchres[1] < 0 || matchres[1] > 12 || matchres[2] < 0 || matchres[2] > 60) $("#cost_calc_tod").addClass("f-tag-wrong")
        else $("#cost_calc_tod").removeClass("f-tag-wrong")
        if (!$("#price_kwh").val().match(/^[\d\.]+$/g) || (parseFloat($("#price_kwh").val()) <= 0)) $("#price_kwh").addClass("f-tag-wrong")
        else $("#price_kwh").removeClass("f-tag-wrong")
        if (!$("#edit-name").val().match(/^.+$/g) || (($("#edit-name").val() != edit_name_no_alert) && ($("#edit-name").val() in current.devices))) $("#edit-name").addClass("f-tag-wrong")
        else $("#edit-name").removeClass("f-tag-wrong")
        if (!$("#edit-ip").val().match(/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/g)) $("#edit-ip").addClass("f-tag-wrong")
        else $("#edit-ip").removeClass("f-tag-wrong")
        if (!$("#edit-update_time").val().match(/^\d+$/g) || (parseInt($("#edit-update_time").val()) <= 0)) $("#edit-update_time").addClass("f-tag-wrong")
        else $("#edit-update_time").removeClass("f-tag-wrong")
        if (!$("#cost_calc_dom_m").val().match(/^\d+$/g) || (parseInt($("#cost_calc_dom_m").val()) <= 0) || (parseInt($("#cost_calc_dom_m").val()) > 31)) $("#cost_calc_dom_m").addClass("f-tag-wrong")
        else $("#cost_calc_dom_m").removeClass("f-tag-wrong")
        matchres = $("#cost_calc_toy").val().match(/^(\d+)\.(\d+)$/);
        if (!matchres || matchres[1] < 1 || matchres[1] > 31 || matchres[2] < 1 || matchres[2] > 12) $("#cost_calc_toy").addClass("f-tag-wrong")
        else $("#cost_calc_toy").removeClass("f-tag-wrong");
    }, 250)

    list_devices();
});

function list_devices() {
    var html = "";
    for (const dname in current.devices) {
        dval = current.devices[dname];
        ccval = dval["cost_calculation"]
        html += "<tr>";
        html += '<td>' + dname + "</td>";
        html += '<td><i data-feather="target"></i> ' + (devices[dval["type"]] || dval["type"] || "undefined") + "</td>";
        html += '<td><i data-feather="monitor"></i> ' + dval["ip"] + "</td>";
        html += '<td><i data-feather="clock"></i> ' + dval["update_time"] + "sec</td>";
        html += '<td>' + (ccval["daily"] ? '<i data-feather="check"></i>' : '<i data-feather="x"></i>') + '<br>' + (ccval["monthly"] ? '<i data-feather="check"></i>' : '<i data-feather="x"></i>') + '<br>' + (ccval["yearly"] ? '<i data-feather="check"></i>' : '<i data-feather="x"></i>') + '</td>';
        ccval = dval["power_on_counter"]
        html += '<td>' + (ccval["daily"] ? '<i data-feather="check"></i>' : '<i data-feather="x"></i>') + '<br>' + (ccval["monthly"] ? '<i data-feather="check"></i>' : '<i data-feather="x"></i>') + '<br>' + (ccval["yearly"] ? '<i data-feather="check"></i>' : '<i data-feather="x"></i>') + '</td>';
        html += '<td><button onclick="edit_device(\'' + dname + '\')"><i data-feather="settings"></i></button><button onclick="delete_device(\'' + dname + '\')"><i data-feather="trash-2"></i></button></td>';
        html += "</tr>";
    }
    $("#devviebod").html(html || "<tr><td>No devices listed.</td></tr>");
    formula.reindex_static()
    feather.replace()
}

function generate() {
    current.general.log_level = $("#log_level").val()
    current.general.cost_calc_request_time_daily = $("#cost_calc_tod").val()
    current.general.cost_calc_request_time_monthly = $("#cost_calc_dom_m").val()
    current.general.cost_calc_request_time_yearly = $("#cost_calc_toy").val()
    current.general.price_kwh = parseFloat($("#price_kwh").val())
    localStorage.setItem("1.6-config", JSON.stringify(current))
    return current;
}

function edit_device(dname) {
    edit_name_no_alert = dname;
    dval = current.devices[dname];
    ccval = dval["cost_calculation"];
    const date = dval["cost_calc_year"]?.split(".")
    
    $("#edit-name").val(dname);
    $("#edit-type").text(dval["type"] || "undefined");
    $("#edit-ip").val(dval["ip"]);
    $("#edit-update_time").val(dval["update_time"]);
    formula.setOptionValue("edit-cost_calc_day", ccval["daily"])
    formula.setOptionValue("edit-cost_calc_month", ccval["monthly"])
    formula.setOptionValue("edit-cost_calc_year", ccval["yearly"])
    ccval = dval["power_on_counter"];
    formula.setOptionValue("edit-poc_day", ccval["daily"])
    formula.setOptionValue("edit-poc_month", ccval["monthly"])
    formula.setOptionValue("edit-poc_year", ccval["yearly"])

    $("#edit-box").css("display", "block");
}


function delete_device(dname) {
    delete current.devices[dname];
    generate()
    list_devices();
}
