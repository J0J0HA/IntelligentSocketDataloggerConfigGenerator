// SUPPORTED DEVICES
const devices = {
    "shelly:plug-s": "Shelly Plug S",
    "shelly:3em": "Shelly 3EM"
};


try {
    var current = JSON.parse(localStorage.getItem("recentlyThisHappend")) || {
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
        saveAs(new Blob([JSON.stringify({general:current.general})]), "isdl_config.json");
    })

    formula.registerButtonAction("save-devices", (self) => {
        saveAs(new Blob([JSON.stringify(current.devices)]), "isdl_devices.json");
    })

    formula.registerButtonAction("add-device", (self) => {
        $("#edit-name").val("New Device");
        $("#edit-type").text("shelly:plug-s");
        $("#edit-ip").val("127.0.0.1");
        $("#edit-update_time").val("30");
        $("#edit-box").css("display", "block");
    })

    formula.registerButtonAction("edit-type-edit", (self) => {
        $("#edit-type").text(prompt("Device Type",$("#edit-type").text()));
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
            update_time: $("#edit-update_time").val()
        }
        $("#edit-box").css("display", "none");
        edit_name_no_alert = "NGGYU"
        generate()
        list_devices()
    })

    formula.registerButtonAction("edit-cancel", (self) => {
        $("#edit-box").css("display", "none");
        edit_name_no_alert = "NGGYU"
    })

    list_devices();
});

function list_devices() {
    var html = "";
    for (const dname in current.devices) {
        dval = current.devices[dname];
        html += "<tr>";
        html += "<td>" + dname + "</td>";
        html += "<td>" + devices[dval["type"]] || dval["type"] + "</td>";
        html += "<td>" + dval["ip"] + "</td>";
        html += "<td>" + dval["update_time"] + "</td>";
        html += '<td><button onclick="edit_device(\'' + dname + '\')" extra-flip>✎</button><button onclick="delete_device(\'' + dname + '\')">✕</button></td>';
        html += "</tr>";
    }
    $("#devviebod").html(html || "<tr><td>No devices listed.</td></tr>");
    formula.reindex_static()
}

function generate() {
    current.general.log_level = $("#log_level").val()
    current.general.cost_calc_request_time = $("#cost_calc_request_time").val()
    current.general.price_kwh = parseFloat($("#price_kwh").val())
    localStorage.setItem("recentlyThisHappend", JSON.stringify(current))
    return current;
}

function edit_device(dname) {
    edit_name_no_alert = dname;
    dval = current.devices[dname];
    $("#edit-name").val(dname);
    $("#edit-type").text(dval["type"] || "undefined");
    $("#edit-ip").val(dval["ip"]);
    $("#edit-update_time").val(dval["update_time"]);
    $("#edit-box").css("display", "block");
}


function delete_device(dname) {
    delete current.devices[dname];
    generate()
    list_devices();
}
