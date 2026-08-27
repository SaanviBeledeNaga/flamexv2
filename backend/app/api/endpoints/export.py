from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.models import ThermalEvent, EventClassification, EventFeature, IndustrialFacility
import xml.etree.ElementTree as ET

router = APIRouter()

@router.get("/kml")
def export_all_kml(db: Session = Depends(get_db)):
    """
    Exports all active thermal anomalies and industrial facilities as an OGC KML file
    for Google Earth Pro / Google Earth Web.
    """
    events = db.query(ThermalEvent).join(EventClassification, isouter=True).join(EventFeature, isouter=True).all()
    facilities = db.query(IndustrialFacility).all()

    kml_content = []
    kml_content.append('<?xml version="1.0" encoding="UTF-8"?>')
    kml_content.append('<kml xmlns="http://www.opengis.net/kml/2.2">')
    kml_content.append('  <Document>')
    kml_content.append('    <name>FlameX Industrial Thermal Intelligence</name>')
    kml_content.append('    <description>Satellite Thermal Anomalies and Industrial Facilities</description>')

    # Define Styles
    kml_content.append('''
    <Style id="fireStyle">
      <IconStyle>
        <scale>1.3</scale>
        <Icon><href>http://maps.google.com/mapfiles/kml/paddle/red-circle.png</href></Icon>
      </IconStyle>
    </Style>
    <Style id="flareStyle">
      <IconStyle>
        <scale>1.1</scale>
        <Icon><href>http://maps.google.com/mapfiles/kml/paddle/ylw-circle.png</href></Icon>
      </IconStyle>
    </Style>
    <Style id="facilityStyle">
      <IconStyle>
        <scale>1.0</scale>
        <Icon><href>http://maps.google.com/mapfiles/kml/shapes/factory.png</href></Icon>
      </IconStyle>
    </Style>
    ''')

    # Add Facilities Folder
    kml_content.append('    <Folder><name>Industrial Facilities</name>')
    for fac in facilities:
        kml_content.append(f'''
      <Placemark>
        <name>{fac.name}</name>
        <styleUrl>#facilityStyle</styleUrl>
        <description><![CDATA[
          <b>Type:</b> {fac.facility_type}<br/>
          <b>Operator:</b> {fac.operator or 'N/A'}<br/>
          <b>Capacity:</b> {fac.capacity or 'N/A'}<br/>
        ]]></description>
        <Point>
          <coordinates>{fac.longitude},{fac.latitude},0</coordinates>
        </Point>
      </Placemark>
        ''')
    kml_content.append('    </Folder>')

    # Add Thermal Events Folder
    kml_content.append('    <Folder><name>Thermal Anomalies</name>')
    for ev in events:
        pred_class = ev.classification.predicted_class if ev.classification else "unknown"
        conf = round((ev.classification.confidence if ev.classification else 0.5) * 100, 1)
        style = "#fireStyle" if pred_class == "industrial_fire" else "#flareStyle"

        kml_content.append(f'''
      <Placemark>
        <name>#{ev.external_id or ev.id} - {pred_class.replace('_', ' ').title()}</name>
        <styleUrl>{style}</styleUrl>
        <description><![CDATA[
          <h3>FlameX AI Diagnosis</h3>
          <b>Predicted Class:</b> {pred_class}<br/>
          <b>Confidence:</b> {conf}%<br/>
          <b>Temperature:</b> {ev.brightness_temperature} K<br/>
          <b>FRP:</b> {ev.frp} MW<br/>
          <b>Satellite:</b> {ev.satellite}<br/>
          <b>Detected:</b> {ev.detected_at.isoformat()}<br/>
          <b>Nearest Facility:</b> {ev.features.nearest_facility_name if ev.features else 'N/A'}<br/>
        ]]></description>
        <Point>
          <coordinates>{ev.longitude},{ev.latitude},100</coordinates>
        </Point>
      </Placemark>
        ''')
    kml_content.append('    </Folder>')

    kml_content.append('  </Document>')
    kml_content.append('</kml>')

    full_xml = "\n".join(kml_content)
    return Response(content=full_xml, media_type="application/vnd.google-earth.kml+xml", headers={
        "Content-Disposition": "attachment; filename=flamex_thermal_intelligence.kml"
    })

@router.get("/events/{event_id}/kml")
def export_event_kml(event_id: int, db: Session = Depends(get_db)):
    event = db.query(ThermalEvent).filter(ThermalEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    pred_class = event.classification.predicted_class if event.classification else "unknown"
    conf = round((event.classification.confidence if event.classification else 0.5) * 100, 1)

    kml = f'''<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>FlameX Event #{event.external_id or event.id}</name>
    <Placemark>
      <name>Event #{event.external_id or event.id} - {pred_class}</name>
      <LookAt>
        <longitude>{event.longitude}</longitude>
        <latitude>{event.latitude}</latitude>
        <altitude>300</altitude>
        <heading>0</heading>
        <tilt>45</tilt>
        <range>1000</range>
      </LookAt>
      <Point>
        <coordinates>{event.longitude},{event.latitude},150</coordinates>
      </Point>
    </Placemark>
  </Document>
</kml>'''

    return Response(content=kml, media_type="application/vnd.google-earth.kml+xml", headers={
        "Content-Disposition": f"attachment; filename=flamex_event_{event_id}.kml"
    })
