def get_recommendations(risk_level):

    if risk_level == "Low":
        return {
            "exercise": [
                "30 minutes walking daily",
                "Light yoga or stretching"
            ],
            "food": [
                "Balanced diet with fruits and vegetables",
                "Drink 2-3 liters of water daily"
            ],
            "sleep": [
                "Sleep 7-8 hours",
                "Maintain regular sleep schedule"
            ]
        }

    elif risk_level == "Medium":
        return {
            "exercise": [
                "30-45 minutes moderate exercise",
                "Cycling or brisk walking"
            ],
            "food": [
                "Reduce sugar and processed food",
                "Eat whole grains and fiber-rich food"
            ],
            "sleep": [
                "Sleep 7-8 hours",
                "Avoid mobile before sleep"
            ]
        }

    elif risk_level == "High":
        return {
            "exercise": [
                "Consult doctor before heavy exercise",
                "Light walking recommended"
            ],
            "food": [
                "Low sugar and low salt diet",
                "Eat more vegetables and lean protein"
            ],
            "sleep": [
                "Ensure 8 hours of sleep",
                "Practice stress reduction techniques"
            ]
        }

    else:
        return {
            "exercise": [],
            "food": [],
            "sleep": []
        }