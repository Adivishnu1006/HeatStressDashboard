//Need to import  imageCollection and region from the GEE

// 1) Dataset
var dataset = ee.ImageCollection("ECMWF/ERA5_LAND/HOURLY");

// 2) Region (South India)
var region = ee.Geometry.Rectangle([72, 8, 85, 22]);




var temp = dataset.select('temperature_2m')
var dew = dataset.select('dewpoint_temperature_2m').filterDate('2026-04-25', '2026-05-02')
.mean().clip(region).subtract(273.15)




var filtered = temp.filterDate('2026-04-25', '2026-05-02')
var MeanTemp = filtered.mean()
var tempC = MeanTemp.subtract(273.15)
var R = tempC.clip(region)
var vis = {
  min: 20 , 
  max : 40,
  palette:['blue', 'cyan', 'yellow', 'orange', 'red']
  
};


var HR = temp
  .filter(ee.Filter.calendarRange(4, 5, 'month')) // April–May only
  .filterDate('2015-01-01', '2020-12-31')         // multiple years
  .mean()
  .subtract(273.15)
  .clip(region);

print (HR)

Map.addLayer(R , vis , 'Current Temparature');
Map.addLayer(HR , vis , 'Historical Temparature');

var anomaly = R.subtract(HR)

var anaVis = {
  
  min : -3,
  max : 3,
   palette: ['blue', 'white', 'red']
  
}



var RH = dew.expression(
  '100 * (exp((17.625 * Td)/(243.04 + Td)) / exp((17.625 * T)/(243.04 + T)))',
  {
    'T': R,
    'Td': dew
  
  }
);

print(RH)



Map.addLayer( anomaly , anaVis , 'Anamoly')

Map.addLayer(RH, {min: 40, max: 100, palette: ['yellow','green','blue']}, 'Relative Humidity');


var heatIndex = R
  .add(RH.multiply(0.33))
  .subtract(0.7);

Map.addLayer(heatIndex, {
  min: 32,
  max: 50,
  palette: ['green','yellow','orange','red','purple']
}, 'Heat Index');

var Hvis = {
    min: 32,
  max: 50,
  palette: ['green','yellow','orange','red','purple']
}

// ---------------- PANEL ----------------
var panel = ui.Panel({
  style: {
    width: '320px',
    padding: '10px',
    backgroundColor: 'rgba(255,255,255,0.95)'
  }
});

// ---------------- TITLE ----------------
var title = ui.Label('🔥 Heat Stress Dashboard', {
  fontSize: '22px',
  fontWeight: 'bold',
  color: '#d32f2f',
  margin: '0 0 8px 0'
});

// ---------------- SUBTITLE ----------------
var subtitle = ui.Label(
  'South India | Temperature, Anomaly & Heat Index Analysis',
  {fontSize: '12px', color: 'gray'}
);

// ---------------- DESCRIPTION ----------------
var description = ui.Label(
  'This app analyzes current heat conditions and compares them with historical averages. It also highlights perceived heat stress using humidity.',
  {fontSize: '12px', margin: '8px 0'}
);

// ---------------- BUTTON STYLE ----------------
var buttonStyle = {
  stretch: 'horizontal',
  margin: '6px 0',
  padding: '8px',
  fontWeight: 'bold'
};

// ---------------- BUTTONS ----------------
var tempBtn = ui.Button({
  label: 'Temperature',
  style: buttonStyle,
  onClick: function() {
    Map.layers().reset();
    Map.addLayer(R, vis, 'Temperature');
    Map.centerObject(region, 5);
  }
});

var anomalyBtn = ui.Button({
  label: 'Anomaly',
  style: buttonStyle,
  onClick: function() {
    Map.layers().reset();
    Map.addLayer(anomaly, anaVis, 'Anomaly');
    Map.centerObject(region, 5);
  }
});

var hiBtn = ui.Button({
  label: 'Heat Index',
  style: buttonStyle,
  onClick: function() {
    Map.layers().reset();
    Map.addLayer(heatIndex, Hvis, 'Heat Index');
    Map.centerObject(region, 5);
  }
});

// ---------------- FOOTER ----------------
var footer = ui.Label(
  'Data: ERA5-Land | Built in Google Earth Engine',
  {fontSize: '10px', color: 'gray', margin: '10px 0 0 0'}
);

// ---------------- ADD EVERYTHING ----------------
panel.add(title);
panel.add(subtitle);
panel.add(description);
panel.add(tempBtn);
panel.add(anomalyBtn);
panel.add(hiBtn);
panel.add(footer);

// Add panel to UI
ui.root.insert(0, panel);
