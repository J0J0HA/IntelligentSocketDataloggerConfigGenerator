// SUPPORTED DEVICES
const devices = {
    "shelly:plug-s": "Shelly Plug S",
    "shelly:3em": "Shelly 3EM"
};

const loglevelicon = {
    "debug": '<i class="fa-solid fa-bug"></i>',
    "info": '<i class="fa-solid fa-circle-info"></i>',
    "warning": '<i class="fa-solid fa-triangle-exclamation"></i>',
    "error": '<i class="fa-solid fa-square-xmark"></i>'
}

if (!String.prototype.padStart) {
    String.prototype.padStart = function (paddingValue) {
        return String(paddingValue + this).slice(-paddingValue.length);
    };
}


try {
    var current = JSON.parse(localStorage.getItem("recentlyThisHappened")) || {
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
    formula.autoassign();
    formula.init();


    formula.registerButtonAction("load-config", async (self) => {
        if (!confirm("This will override your current general settings.")) return;
        const data = await $("#config-file").prop('files')[0].text();
        current.general = JSON.parse(data)["general"];
        $("#log_level").val(current.general.log_level);
        $("#cost_calc_request_time").val(current.general.cost_calc_request_time);
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
        $("#dayofmonth").val("1");
        $("#dayofyear").val("1");
        $("#monthofyear").val("1");

        formula.setOptionValue("edit-cost_calc_day", true)
        formula.setOptionValue("edit-cost_calc_month", false)
        formula.setOptionValue("edit-cost_calc_year", false)

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
        cost_calc = {}
        if (formula.getOptionValue("edit-cost_calc_day")) {
            cost_calc["cost_calc_day"] = true;
        }
        if (formula.getOptionValue("edit-cost_calc_month")) {
            cost_calc["cost_calc_month"] = $("#dayofmonth").val().padStart(2, "0");
        }
        if (formula.getOptionValue("edit-cost_calc_year")) {
            cost_calc["cost_calc_year"] = $("#dayofyear").val().padStart(2, "0") + "." + $("#monthofyear").val().padStart(2, "0");
        }
        current.devices[ename] = {
            type: $("#edit-type").text(),
            ip: $("#edit-ip").val(),
            update_time: $("#edit-update_time").val(),
            ...cost_calc
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
        $("[name=filltime]").text($("#cost_calc_request_time").val())
        $("#selected_icon").html(loglevelicon[$("#log_level").val()])

        // Check values to be valid here!
        if (!$("#cost_calc_request_time").val().match(/^\d\d\:\d\d$/g)) $("#cost_calc_request_time").addClass("f-tag-wrong")
        else $("#cost_calc_request_time").removeClass("f-tag-wrong")
        if (!$("#price_kwh").val().match(/^[\d\.]+$/g) || (parseFloat($("#price_kwh").val()) <= 0)) $("#price_kwh").addClass("f-tag-wrong")
        else $("#price_kwh").removeClass("f-tag-wrong")
        if (!$("#edit-name").val().match(/^.+$/g) || (($("#edit-name").val() != edit_name_no_alert) && ($("#edit-name").val() in current.devices))) $("#edit-name").addClass("f-tag-wrong")
        else $("#edit-name").removeClass("f-tag-wrong")
        if (!$("#edit-ip").val().match(/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/g)) $("#edit-ip").addClass("f-tag-wrong")
        else $("#edit-ip").removeClass("f-tag-wrong")
        if (!$("#edit-update_time").val().match(/^\d+$/g) || (parseInt($("#edit-update_time").val()) <= 0)) $("#edit-update_time").addClass("f-tag-wrong")
        else $("#edit-update_time").removeClass("f-tag-wrong")
        if (!$("#dayofmonth").val().match(/^\d+$/g) || (parseInt($("#dayofmonth").val()) <= 0) || (parseInt($("#dayofmonth").val()) > 31)) $("#dayofmonth").addClass("f-tag-wrong")
        else $("#dayofmonth").removeClass("f-tag-wrong")
        if (!$("#dayofyear").val().match(/^\d+$/g) || (parseInt($("#dayofyear").val()) <= 0) || (parseInt($("#dayofyear").val()) > 31)) $("#dayofyear").addClass("f-tag-wrong")
        else $("#dayofyear").removeClass("f-tag-wrong")
        if (!$("#monthofyear").val().match(/^\d+$/g) || (parseInt($("#monthofyear").val()) <= 0) || (parseInt($("#monthofyear").val()) > 12)) $("#monthofyear").addClass("f-tag-wrong")
        else $("#monthofyear").removeClass("f-tag-wrong")
    }, 250)

    list_devices();
});

function list_devices() {
    var html = "";
    for (const dname in current.devices) {
        dval = current.devices[dname];
        html += "<tr>";
        html += '<td>' + dname + "</td>";
        html += '<td><i class="fa-solid fa-bullseye"></i> ' + (devices[dval["type"]] || dval["type"] || "undefined") + "</td>";
        html += '<td><i class="fa-solid fa-display"></i> ' + dval["ip"] + "</td>";
        html += '<td><i class="fa-regular fa-clock"></i> ' + dval["update_time"] + "sec</td>";
        html += '<td>' + (dval["cost_calc_day"] ? '<i class="fa-solid fa-check"></i>' : '<i class="fa-solid fa-xmark"></i>') + '<br>' + (dval["cost_calc_month"] ? ('<i class="fa-solid fa-calendar-days"></i> ' + dval["cost_calc_month"] + ".") : '<i class="fa-solid fa-xmark"></i>') + '<br>' + (dval["cost_calc_year"] ? ('<i class="fa-solid fa-calendar-days"></i> ' + dval["cost_calc_year"] + ".") : '<i class="fa-solid fa-xmark"></i>') + '</td>';
        html += '<td><button onclick="edit_device(\'' + dname + '\')"><i class="fa-solid fa-gear"></i></button><button onclick="delete_device(\'' + dname + '\')"><i class="fa-solid fa-trash-can"></i></button></td>';
        html += "</tr>";
    }
    $("#devviebod").html(html || "<tr><td>No devices listed.</td></tr>");
    formula.reindex_static()
}

function generate() {
    current.general.log_level = $("#log_level").val()
    current.general.cost_calc_request_time = $("#cost_calc_request_time").val()
    current.general.price_kwh = parseFloat($("#price_kwh").val())
    localStorage.setItem("recentlyThisHappened", JSON.stringify(current))
    return current;
}

function edit_device(dname) {
    edit_name_no_alert = dname;
    dval = current.devices[dname];
    const date = dval["cost_calc_year"]?.split(".")

    $("#edit-name").val(dname);
    $("#edit-type").text(dval["type"] || "undefined");
    $("#edit-ip").val(dval["ip"]);
    $("#edit-update_time").val(dval["update_time"]);
    $("#dayofmonth").val(dval["cost_calc_month"] || "1");
    $("#dayofyear").val(date?.[0] || "1");
    $("#monthofyear").val(date?.[1] || "1");
    formula.setOptionValue("edit-cost_calc_day", dval["cost_calc_day"])
    formula.setOptionValue("edit-cost_calc_month", dval["cost_calc_month"])
    formula.setOptionValue("edit-cost_calc_year", dval["cost_calc_year"])

    $("#edit-box").css("display", "block");
}


function delete_device(dname) {
    delete current.devices[dname];
    generate()
    list_devices();
}
