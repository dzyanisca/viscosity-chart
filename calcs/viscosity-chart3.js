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

function getViscx(e) {
    var t = parseFloat(jQuery("#temp1_m").val()),
        r = parseFloat(jQuery("#visc1_m").val()),
        a = parseFloat(jQuery("#temp2_m").val()),
        i = parseFloat(jQuery("#visc2_m").val()),
        o = 273.15,
        l = 0.7;
    return (
        Math.pow(
            10,
            Math.pow(10, log10(log10(r + l)) + ((log10(log10(i + l)) - log10(log10(r + l))) / (log10(t + o) - log10(a + o))) * log10(t + o) - ((log10(log10(i + l)) - log10(log10(r + l))) / (log10(t + o) - log10(a + o))) * log10(e + o))
        ) - l
    );
}

function getVI() {
    var e,
        t,
        r = parseFloat(jQuery("#temp1_m").val()),
        a = parseFloat(jQuery("#visc1_m").val()),
        i = parseFloat(jQuery("#temp2_m").val()),
        o = parseFloat(jQuery("#visc2_m").val());
    if (((e = 100 == r ? a : 100 == i ? o : getViscx(100)), (t = 40 == r ? a : 40 == i ? o : getViscx(40)), e < 2))
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
            ? jQuery("#procedure").html("by ISO 2909:2002 Procedures A and B<br>by ASTM D2270-04 Procedures A and B<br>by Ð“ÐžÐ¡Ð¢ 25371-2018 ÐœÐµÑ‚Ð¾Ð´Ñ‹ Ð Ð¸ Ð‘")
            : n < 100
            ? ((n = Math.round(((c - t) / (c - l)) * 100)), jQuery("#procedure").html("by ISO 2909:2002 Procedure A<br>by ASTM D2270-04 Procedure A<br>by Ð“ÐžÐ¡Ð¢ 25371-2018 ÐœÐµÑ‚Ð¾Ð´ Ð"))
            : jQuery("#procedure").html("by ISO 2909:2002 Procedure B<br>by ASTM D2270-04 Procedure B<br>by Ð“ÐžÐ¡Ð¢ 25371-2018 ÐœÐµÑ‚Ð¾Ð´ Ð‘"),
        n
    );
}

function recalc() {
    var e = parseFloat(jQuery("#tempx_m").val());
    jQuery("#viscx_m").val(getViscx(e).toFixed(rnd_visc)), jQuery("#viscx_i").val(cSt_to_SUS(jQuery("#viscx_m").val()).toFixed(rnd_visc)), jQuery("#vi").val(getVI()), drawChart();
}

function getChartData() {
    var e = parseFloat(jQuery("#tempx_m").val()),
        t = new Array(),
        r = min_temp,
        a = 1;
    Graph.selection = !1;
    do {
        (t_m = parseFloat(r)), (t_i = C_to_F(r));
        var i = parseFloat(getViscx(r)),
            o = cSt_to_SUS(i);
        t.push([t_m, i, i.toFixed(rnd_visc) + " cSt @ " + t_m.toFixed(rnd_temp) + " *C\r\n" + o.toFixed(rnd_visc) + " SUS @ " + t_i.toFixed(rnd_temp) + " *F"]),
            e <= r + temp_step && 0 == Graph.selection && (Graph.selection = [{ row: a, column: 1 }]),
            (r += temp_step),
            a++;
    } while (r <= max_temp);
    return t;
}

function drawChart() {
    var l = new google.visualization.DataTable();
    function e() {
        var o = new google.visualization.LineChart(document.getElementById("chart_div"));
        o.draw(l, options),
            o.setSelection(Graph.selection),
            google.visualization.events.addListener(o, "select", function () {
                var e = o.getSelection();
                if (0 < e.length) {
                    for (var t = 0; t < e.length; t++) var r = e[t];
                    var a = parseFloat(l.getFormattedValue(r.row, r.column).replace(",", "")),
                        i = parseFloat(l.getFormattedValue(r.row, 0));
                    jQuery("#tempx_m").val(i), jQuery("#viscx_m").val(a), jQuery("#tempx_i").val(C_to_F(i).toFixed(rnd_temp)), jQuery("#viscx_i").val(cSt_to_SUS(a).toFixed(rnd_visc));
                }
            });
    }
    l.addColumn("number", "Temperature, *C"), l.addColumn("number", "Viscosity, cSt"), l.addColumn({ type: "string", role: "tooltip" }), l.addRows(getChartData()), (window.onload = e()), (window.onresize = e);
}

jQuery(".specified").change(function () {
    switch (jQuery(this).attr("id")) {
        case "tempx_m":
            jQuery("#tempx_i").val(C_to_F(jQuery("#tempx_m").val()).toFixed(rnd_temp));
            break;
        case "tempx_i":
            jQuery("#tempx_m").val(F_to_C(jQuery("#tempx_i").val()).toFixed(rnd_temp));
    }
    recalc();
}),
    jQuery(".calc").change(function () {
        switch (jQuery(this).attr("id")) {
            case "temp1_m":
                jQuery("#temp1_i").val(C_to_F(jQuery("#temp1_m").val()).toFixed(rnd_temp));
                break;
            case "temp1_i":
                jQuery("#temp1_m").val(F_to_C(jQuery("#temp1_i").val()).toFixed(rnd_temp));
                break;
            case "visc1_m":
                jQuery("#visc1_m").val() < 2 && (alert("Viscosity value is out of allowable range."), jQuery("#visc1_m").val(2)), jQuery("#visc1_i").val(cSt_to_SUS(jQuery("#visc1_m").val()).toFixed(rnd_visc));
                break;
            case "visc1_i":
                jQuery("#visc1_i").val() < 34 && (alert("Viscosity value is out of allowable range."), jQuery("#visc1_i").val(34)), jQuery("#visc1_m").val(SUS_to_cSt(jQuery("#visc1_i").val()).toFixed(rnd_visc));
                break;
            case "temp2_m":
                jQuery("#temp2_i").val(C_to_F(jQuery("#temp2_m").val()).toFixed(rnd_temp));
                break;
            case "temp2_i":
                jQuery("#temp2_m").val(F_to_C(jQuery("#temp2_i").val()).toFixed(rnd_temp));
                break;
            case "visc2_m":
                jQuery("#visc2_m").val() < 2 && (alert("Viscosity value is out of allowable range."), jQuery("#visc2_m").val(2)), jQuery("#visc2_i").val(cSt_to_SUS(jQuery("#visc2_m").val()).toFixed(rnd_visc));
                break;
            case "visc2_i":
                jQuery("#visc2_i").val() < 34 && (alert("Viscosity value is out of allowable range."), jQuery("#visc2_i").val(34)), jQuery("#visc2_m").val(SUS_to_cSt(jQuery("#visc2_i").val()).toFixed(rnd_visc));
        }
        jQuery("#oil option[value=custom]").attr("selected", "selected"), recalc();
    }),

    jQuery("#oil").change(function () {
        switch (jQuery("#oil").val()) {
            case "ISO VG 22":
                jQuery("#temp1_m").val(40), jQuery("#visc1_m").val(22), jQuery("#temp2_m").val(100), jQuery("#visc2_m").val(4.29);
                break;
            case "ISO VG 32":
                jQuery("#temp1_m").val(40), jQuery("#visc1_m").val(32), jQuery("#temp2_m").val(100), jQuery("#visc2_m").val(5.36);
                break;
            case "ISO VG 46":
                jQuery("#temp1_m").val(40), jQuery("#visc1_m").val(46), jQuery("#temp2_m").val(100), jQuery("#visc2_m").val(6.76);
                break;
            case "ISO VG 68":
                jQuery("#temp1_m").val(40), jQuery("#visc1_m").val(68), jQuery("#temp2_m").val(100), jQuery("#visc2_m").val(8.73);
        }

        jQuery("#temp1_i").val(C_to_F(jQuery("#temp1_m").val()).toFixed(rnd_temp)),
            jQuery("#visc1_i").val(cSt_to_SUS(jQuery("#visc1_m").val()).toFixed(rnd_visc)),
            jQuery("#temp2_i").val(C_to_F(jQuery("#temp2_m").val()).toFixed(rnd_temp)),
            jQuery("#visc2_i").val(cSt_to_SUS(jQuery("#visc2_m").val()).toFixed(rnd_visc)),
            recalc();
    });

var Graph = new Object(),
    options = {
        legend: { position: "none" },
        series: { 0: { color: "#1c91c0" } },
        title: "Temperature-Viscosity Chart",
        height: 600,
        hAxis: { title: "Temperature, *C", gridlines: { count: 16 }, titleTextStyle: { italic: !1, color: "brown" } },
        vAxis: { title: "Kinematic Viscosity, cSt", scaleType: "log", titleTextStyle: { italic: !1, color: "brown" } },
        crosshair: { color: "#e7711b", opacity: 0.8, trigger: "selection" },
    };
    
google.load("visualization", "1", { packages: ["corechart", "line"] }), google.setOnLoadCallback(drawChart);
