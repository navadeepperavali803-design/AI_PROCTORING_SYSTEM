import cv2
import numpy as np
import os
from typing import List, Tuple, Dict, Any, Optional

class FaceDetector:
    """
    Modular Face Presence & Count Detector using OpenCV cascade classifiers.
    Detects single student presence, absence, and multiple unauthorized individuals.
    """
    def __init__(self, min_face_size: Tuple[int, int] = (60, 60)):
        cascade_path = os.path.join(cv2.data.haarcascades, "haarcascade_frontalface_default.xml")
        profile_path = os.path.join(cv2.data.haarcascades, "haarcascade_profileface.xml")

        self.face_cascade = cv2.CascadeClassifier(cascade_path)
        self.profile_cascade = cv2.CascadeClassifier(profile_path)
        self.min_face_size = min_face_size

    def detect(self, frame: np.ndarray) -> Dict[str, Any]:
        """
        Processes a BGR video frame and determines face presence and count.
        
        Returns:
            dict containing:
                - face_count (int)
                - status (str: 'ABSENT', 'SINGLE', 'MULTIPLE')
                - faces (list of [x, y, w, h])
                - confidence (float)
        """
        if frame is None or frame.size == 0:
            return {
                "face_count": 0,
                "status": "ABSENT",
                "faces": [],
                "confidence": 0.0,
            }

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.equalizeHist(gray)

        # Detect frontal faces
        frontal_faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.15,
            minNeighbors=5,
            minSize=self.min_face_size,
            flags=cv2.CASCADE_SCALE_IMAGE
        )

        faces = list(frontal_faces) if len(frontal_faces) > 0 else []

        # If no frontal faces found, check profile face (student turned sideways)
        if len(faces) == 0:
            profile_faces = self.profile_cascade.detectMultiScale(
                gray,
                scaleFactor=1.2,
                minNeighbors=4,
                minSize=self.min_face_size,
            )
            if len(profile_faces) > 0:
                faces = list(profile_faces)

        count = len(faces)
        if count == 0:
            status = "ABSENT"
            confidence = 0.95
        elif count == 1:
            status = "SINGLE"
            confidence = 0.92
        else:
            status = "MULTIPLE"
            confidence = min(0.98, 0.70 + (count * 0.1))

        formatted_faces = [[int(x), int(y), int(w), int(h)] for (x, y, w, h) in faces]

        return {
            "face_count": count,
            "status": status,
            "faces": formatted_faces,
            "confidence": float(confidence),
        }
