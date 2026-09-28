/*
Temperature-Viscosity Chart
Copright by Dzyanis Sukhanitski
https://fluidpower.pro
*/
var rnd_temp = 1,
    rnd_visc = 2,
    rnd_vi = 0,
    min_temp = -30,
    max_temp = 120,
    temp_step = 1;

function log10(e) {
    return Math.log(e) / Math.LN10;
}

function interpolation(e, t, r, a, i) {
    return ((i - e) * (a - r)) / (t - e) + r;
}

function C_to_F(e) {
    return 1.8 * e + 32;
}

function F_to_C(e) {
    return (5 / 9) * (e - 32);
}

function SUS_to_cSt(e) {
    return 240 < (e = parseFloat(e)) ? e / 4.635 : 100 < e ? 0.2193 * e - 134.6 / e : 32 < e ? 0.2253 * e - 194.4 / e : NaN;
}

function cSt_to_SUS(e) {
    return 52 < (e = parseFloat(e)) ? 4.635 * e : 20.5 < e ? (e + Math.sqrt(Math.pow(e, 2) + 118.07)) / 0.4386 : 1 < e ? (e + Math.sqrt(Math.pow(e, 2) + 175.2)) / 0.4506 : NaN;
}

function getViscx(e, oil) {
    var t = parseFloat(oilField("temp1_m", oil).val()),
        r = parseFloat(oilField("visc1_m", oil).val()),
        a = parseFloat(oilField("temp2_m", oil).val()),
        i = parseFloat(oilField("visc2_m", oil).val()),
        o = 273.15,
        l = 0.7;
    return (
        Math.pow(
            10,
            Math.pow(10, log10(log10(r + l)) + ((log10(log10(i + l)) - log10(log10(r + l))) / (log10(t + o) - log10(a + o))) * log10(t + o) - ((log10(log10(i + l)) - log10(log10(r + l))) / (log10(t + o) - log10(a + o))) * log10(e + o))
        ) - l
    );
}

function getVI(oil) {
    var e,
        t,
        r = parseFloat(oilField("temp1_m", oil).val()),
        a = parseFloat(oilField("visc1_m", oil).val()),
        i = parseFloat(oilField("temp2_m", oil).val()),
        o = parseFloat(oilField("visc2_m", oil).val());
    if (((e = 100 == r ? a : 100 == i ? o : getViscx(100, oil)), (t = 40 == r ? a : 40 == i ? o : getViscx(40, oil)), e < 2))
        var l = e * (1.35017 + 0.59482 * e),
            c = e * (1.5215 + 0.7092 * e);
    else if (70 < e) (l = 0.1684 * Math.pow(e, 2) + 11.85 * e - 97), (c = 0.8353 * Math.pow(e, 2) + 14.67 * e - 216);
    else {
        for (var _ = 0; _++, e > L_and_H[_][0]; );
        var v = L_and_H[_ - 1],
            s = L_and_H[_];
        (c = interpolation(v[0], s[0], v[1], s[1], e)), (l = interpolation(v[0], s[0], v[2], s[2], e));
    }
    var u = (log10(l) - log10(t)) / log10(e),
        n = Math.round((Math.pow(10, u) - 1) / 0.00715 + 100);
    return (
        100 == n
            ? oilField("procedure", oil).html("by ISO 2909:2002 Procedures A and B<br>by ASTM D2270-04 Procedures A and B<br>by ГОСТ 25371-2018 Методы А и Б")
            : n < 100
            ? ((n = Math.round(((c - t) / (c - l)) * 100)), oilField("procedure", oil).html("by ISO 2909:2002 Procedure A<br>by ASTM D2270-04 Procedure A<br>by ГОСТ 25371-2018 Метод А"))
            : oilField("procedure", oil).html("by ISO 2909:2002 Procedure B<br>by ASTM D2270-04 Procedure B<br>by ГОСТ 25371-2018 Метод Б"),
        n
    );
}


// Keep Oil 1's original field IDs and suffix the second table's fields.
function oilField(id, oil) {
    return jQuery("#" + id + (oil === 2 ? "_oil2" : ""));
}

var oil2Visible = false;
var chartReady = false;
var chart;
var chartData;
var options = {
    legend: { position: "bottom" },
    series: { 0: { color: "#1c91c0" }, 1: { color: "#ff00ff" } },
    title: "Temperature-Viscosity Chart",
    height: 600,
    hAxis: { title: "Temperature, °C", gridlines: { count: 16 }, titleTextStyle: { italic: false, color: "brown" } },
    vAxis: { title: "Kinematic Viscosity, cSt", scaleType: "log", titleTextStyle: { italic: false, color: "brown" } },
    crosshair: { color: "#e7711b", opacity: 0.8, trigger: "selection" }
};

function updateResults() {
    var temperature = parseFloat(jQuery("#tempx_m").val());
    for (var oil = 1; oil <= (oil2Visible ? 2 : 1); oil++) {
        var viscosity = getViscx(temperature, oil);
        oilField("viscx_m", oil).val(viscosity.toFixed(rnd_visc));
        oilField("viscx_i", oil).val(cSt_to_SUS(viscosity).toFixed(rnd_visc));
        oilField("vi", oil).val(getVI(oil));
    }
}

function recalc() {
    updateResults();
    drawChart();
}

function getChartData() {
    var rows = [];
    for (var temperature = min_temp; temperature <= max_temp; temperature += temp_step) {
        var row = [temperature];
        for (var oil = 1; oil <= (oil2Visible ? 2 : 1); oil++) {
            var viscosity = getViscx(temperature, oil);
            row.push(Number.isFinite(viscosity) && viscosity > 0 ? viscosity : null);
            row.push("Oil " + oil + ": " + viscosity.toFixed(rnd_visc) + " cSt @ " + temperature.toFixed(rnd_temp) + " °C\n" +
                cSt_to_SUS(viscosity).toFixed(rnd_visc) + " SUS @ " + C_to_F(temperature).toFixed(rnd_temp) + " ?F");
        }
        rows.push(row);
    }
    return rows;
}

function drawChart() {
    if (!chartReady) return;
    chartData = new google.visualization.DataTable();
    chartData.addColumn("number", "Temperature, °C");
    for (var oil = 1; oil <= (oil2Visible ? 2 : 1); oil++) {
        chartData.addColumn("number", "Oil " + oil + " - " + oilField("oil", oil).val());
        chartData.addColumn({ type: "string", role: "tooltip" });
    }
    chartData.addRows(getChartData());
    chart.draw(chartData, options);
    var temperature = parseFloat(jQuery("#tempx_m").val());
    var selection = [];
    if (Number.isFinite(temperature) && temperature >= min_temp && temperature <= max_temp) {
        var row = Math.round((temperature - min_temp) / temp_step);
        selection.push({ row: row, column: 1 });
        if (oil2Visible) selection.push({ row: row, column: 3 });
    }
    chart.setSelection(selection);
}

function applyPreset(oil) {
    var presets = {
        "ISO VG 22": [22, 4.29],
        "ISO VG 32": [32, 5.36],
        "ISO VG 46": [46, 6.76],
        "ISO VG 68": [68, 8.73]
    };
    var preset = presets[oilField("oil", oil).val()];
    if (preset) {
        oilField("temp1_m", oil).val(40);
        oilField("visc1_m", oil).val(preset[0]);
        oilField("temp2_m", oil).val(100);
        oilField("visc2_m", oil).val(preset[1]);
    }
    for (var point = 1; point <= 2; point++) {
        oilField("temp" + point + "_i", oil).val(C_to_F(oilField("temp" + point + "_m", oil).val()).toFixed(rnd_temp));
        oilField("visc" + point + "_i", oil).val(cSt_to_SUS(oilField("visc" + point + "_m", oil).val()).toFixed(rnd_visc));
    }
}

var secondTable = jQuery("#oil1_table").clone();
secondTable.attr("id", "oil2_table").prop("hidden", true);
secondTable.find("[id]").each(function () { this.id += "_oil2"; });
secondTable.find("caption").text("Oil 2 Chart").css("color", "#ff00ff");
secondTable.insertAfter("#oil1_table");
// Start with a different preset so both curves are immediately visible.
oilField("oil", 2).val("ISO VG 68");
applyPreset(2);

jQuery("#toggle_oil2").on("click", function () {
    oil2Visible = !oil2Visible;
    secondTable.prop("hidden", !oil2Visible);
    jQuery(this).text(oil2Visible ? "Hide Oil 2 Chart" : "Add Oil 2 Chart").attr("aria-expanded", String(oil2Visible));
    recalc();
});

jQuery(".specified").on("change", function () {
    if (this.id === "tempx_m") {
        jQuery("#tempx_i").val(C_to_F(this.value).toFixed(rnd_temp));
    } else {
        jQuery("#tempx_m").val(F_to_C(this.value).toFixed(rnd_temp));
    }
    recalc();
});

jQuery(".calc").on("change", function () {
    var oil = this.id.endsWith("_oil2") ? 2 : 1;
    var id = this.id.replace(/_oil2$/, "");
    var metric = id.endsWith("_m");
    var temperature = id.startsWith("temp");
    var value = parseFloat(this.value);
    if (!temperature && value < (metric ? 2 : 34)) {
        alert("Viscosity value is out of allowable range.");
        value = metric ? 2 : 34;
        jQuery(this).val(value);
    }
    var converted = temperature ? (metric ? C_to_F(value) : F_to_C(value)) :
        (metric ? cSt_to_SUS(value) : SUS_to_cSt(value));
    oilField(id.slice(0, -1) + (metric ? "i" : "m"), oil).val(converted.toFixed(temperature ? rnd_temp : rnd_visc));
    oilField("oil", oil).val("custom");
    recalc();
});

jQuery("#oil, #oil_oil2").on("change", function () {
    applyPreset(this.id === "oil" ? 1 : 2);
    recalc();
});

recalc();
google.charts.load("current", { packages: ["corechart"] });
google.charts.setOnLoadCallback(function () {
    chart = new google.visualization.LineChart(document.getElementById("chart_div"));
    chartReady = true;
    google.visualization.events.addListener(chart, "select", function () {
        var selection = chart.getSelection();
        if (!selection.length || selection[0].row == null) return;
        var temperature = chartData.getValue(selection[0].row, 0);
        jQuery("#tempx_m").val(temperature.toFixed(rnd_temp));
        jQuery("#tempx_i").val(C_to_F(temperature).toFixed(rnd_temp));
        updateResults();
    });
    drawChart();
    window.addEventListener("resize", drawChart);
});
