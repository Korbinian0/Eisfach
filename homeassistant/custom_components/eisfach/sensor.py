import logging
import requests
from datetime import timedelta
from homeassistant.components.sensor import SensorEntity
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, CoordinatorEntity

_LOGGER = logging.getLogger(__name__)
SCAN_INTERVAL = timedelta(minutes=60)

async def async_setup_entry(hass, entry, async_add_entities):
    url = entry.data.get("url", "http://localhost:8000/api/ha/inventory")
    
    async def async_update_data():
        def fetch():
            try:
                response = requests.get(url, timeout=10)
                response.raise_for_status()
                return response.json()
            except Exception as e:
                _LOGGER.error("Fehler beim Abrufen von Eisfach: %s", e)
                return {"items": [], "count": 0}
        
        return await hass.async_add_executor_job(fetch)

    coordinator = DataUpdateCoordinator(
        hass,
        _LOGGER,
        name="eisfach",
        update_method=async_update_data,
        update_interval=SCAN_INTERVAL,
    )

    await coordinator.async_config_entry_first_refresh()
    async_add_entities([EisfachSensor(coordinator)])

class EisfachSensor(CoordinatorEntity, SensorEntity):
    def __init__(self, coordinator):
        super().__init__(coordinator)
        self._attr_name = "Eisfach Bestand"
        self._attr_unique_id = "eisfach_inventory_sensor"
        self._attr_icon = "mdi:snowflake"

    @property
    def native_value(self):
        return self.coordinator.data.get("count", 0)

    @property
    def extra_state_attributes(self):
        return {"items": self.coordinator.data.get("items", [])}
