# These 5 tests and ranges were extracted directly from the required Kaggle dataset

REFERENCE_RANGES = {
    "Ferritin": {
        "min": 15.0, "max": 150.0, "unit": "ug/L",
        "unit_description": "Mikrogram/Litre",
        "recommended_followup": "Demir açısından zengin beslenme"
    },
    "Glikozile Hemoglobin (HbA1c)": {
        "min": 4.0, "max": 6.0, "unit": "%",
        "unit_description": "Yüzde",
        "recommended_followup": "Mevcut düzeni koruma"
    },
    "Total IgE": {
        "min": 0.1, "max": 100.0, "unit": "KU/L",
        "unit_description": "KiloÜnite/Litre",
        "recommended_followup": "Takip gerekmez"
    },
    "Insulin": {
        "min": 2.6, "max": 24.9, "unit": "mU/L",
        "unit_description": "MiliÜnite/Litre",
        "recommended_followup": "Mevcut düzeni koruma"
    },
    "Serbest T4": {
        "min": 0.87, "max": 1.70, "unit": "ng/dL",
        "unit_description": "Nanogram/Desilitre",
        "recommended_followup": "Rutin kontrol"
    },
    "pH (Strip)": {
        "min": 5.0, "max": 9.0, "unit": "-",
        "unit_description": "pH değeri",
        "recommended_followup": "Takip gerekmez"
    },
    "Dansite (Strip)": {
        "min": 1.010, "max": 1.030, "unit": "-",
        "unit_description": "-",
        "recommended_followup": "Takip gerekmez"
    },
    "Eritrosit": {
        "min": 3.8, "max": 5.2, "unit": "10^6/uL",
        "unit_description": "Milyon/µL",
        "recommended_followup": "Rutin kontrol"
    },
    "RDW-SD": {
        "min": 36.4, "max": 46.3, "unit": "fL",
        "unit_description": "Femtolitre",
        "recommended_followup": "Rutin kontrol"
    },
    "RDW": {
        "min": 11.5, "max": 14.5, "unit": "%",
        "unit_description": "Yüzde",
        "recommended_followup": "Rutin kontrol"
    },
    "PDW": {
        "min": 9.8, "max": 16.1, "unit": "fL",
        "unit_description": "Femtolitre",
        "recommended_followup": "Rutin kontrol"
    },
    "PCT": {
        "min": 0.17, "max": 0.38, "unit": "%",
        "unit_description": "Yüzde",
        "recommended_followup": "Rutin kontrol"
    },
    "Nötrofil%": {
        "min": 50.0, "max": 70.0, "unit": "%",
        "unit_description": "Yüzde",
        "recommended_followup": "Rutin kontrol"
    },
    "Monosit%": {
        "min": 2.0, "max": 11.0, "unit": "%",
        "unit_description": "Yüzde",
        "recommended_followup": "Rutin kontrol"
    },
    "Lenfosit%": {
        "min": 18.0, "max": 42.0, "unit": "%",
        "unit_description": "Yüzde",
        "recommended_followup": "Rutin kontrol"
    },
    "Hematokrit": {
        "min": 35.0, "max": 49.0, "unit": "%",
        "unit_description": "Yüzde",
        "recommended_followup": "Rutin kontrol"
    }
}
