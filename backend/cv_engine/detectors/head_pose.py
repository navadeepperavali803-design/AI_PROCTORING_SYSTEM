import cv2
import numpy as np
import os
import math
from typing import Dict, Any, Optional, Tuple

class HeadPoseEstimator:
    """
    Continuous 3D Head Pose Estimator using OpenCV Perspective-n-Point (solvePnP).
    Computes Yaw, Pitch, and Roll Euler angles.
    """
    def __init__(
        self,
        yaw_threshold: float = 25.0,
        pitch_threshold: float = 20.0
    ):
        self.yaw_threshold = yaw_threshold
        self.pitch_threshold = pitch_threshold

        eye_cascade_path = os.path.join(cv2.data.haarcascades, "haarcascade_eye.xml")
        self.eye_cascade = cv2.CascadeClassifier(eye_cascade_path)

        # Standard 3D anthropometric facial model points (in mm)
        self.model_points = np.array([
            (0.0, 0.0, 0.0),             # Nose tip
            (0.0, -330.0, -65.0),        # Chin
            (-225.0, 170.0, -135.0),     # Left eye left corner
            (225.0, 170.0, -135.0),      # Right eye right corner
            (-150.0, -150.0, -125.0),    # Left Mouth corner
            (150.0, -150.0, -125.0)      # Right mouth corner
        ], dtype=np.float64)

    def estimate(
        self,
        frame: np.ndarray,
        face_bbox: Optional[Tuple[int, int, int, int]] = None
    ) -> Dict[str, Any]:
        """
        Estimates Euler angles (Yaw, Pitch, Roll) for the candidate face.
        """
        if frame is None or frame.size == 0 or face_bbox is None:
            return {
                "yaw": 0.0,
                "pitch": 0.0,
                "roll": 0.0,
                "is_looking_away": False,
                "gaze_direction": "CENTER",
                "confidence": 0.0,
            }

        x, y, w, h = face_bbox
        img_h, img_w = frame.shape[:2]

        # Ensure bbox within bounds
        x = max(0, min(x, img_w - 1))
        y = max(0, min(y, img_h - 1))
        w = max(10, min(w, img_w - x))
        h = max(10, min(h, img_h - y))

        face_roi = frame[y:y+h, x:x+w]
        gray_roi = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)

        # Detect eyes within face ROI
        eyes = self.eye_cascade.detectMultiScale(
            gray_roi,
            scaleFactor=1.1,
            minNeighbors=3,
            minSize=(int(w * 0.15), int(h * 0.15))
        )

        # Approximate 2D image points
        # If eyes detected, use their actual centroids
        if len(eyes) >= 2:
            # Sort by X coordinate to distinguish left vs right eye
            sorted_eyes = sorted(eyes, key=lambda e: e[0])
            left_eye_center = (
                float(x + sorted_eyes[0][0] + sorted_eyes[0][2] / 2),
                float(y + sorted_eyes[0][1] + sorted_eyes[0][3] / 2)
            )
            right_eye_center = (
                float(x + sorted_eyes[-1][0] + sorted_eyes[-1][2] / 2),
                float(y + sorted_eyes[-1][1] + sorted_eyes[-1][3] / 2)
            )
            # Nose is approximately halfway between eyes and 20% lower
            nose_center = (
                (left_eye_center[0] + right_eye_center[0]) / 2,
                (left_eye_center[1] + right_eye_center[1]) / 2 + h * 0.22
            )
            # Estimate horizontal asymmetry for yaw
            eye_midpoint = (left_eye_center[0] + right_eye_center[0]) / 2
            face_center_x = x + w / 2
            horizontal_offset = (nose_center[0] - face_center_x) / (w / 2)
        else:
            # Default geometric approximations based on face box
            nose_center = (float(x + w * 0.5), float(y + h * 0.52))
            left_eye_center = (float(x + w * 0.3), float(y + h * 0.35))
            right_eye_center = (float(x + w * 0.7), float(y + h * 0.35))
            horizontal_offset = 0.0

        chin_center = (float(x + w * 0.5), float(y + h * 0.95))
        left_mouth = (float(x + w * 0.35), float(y + h * 0.75))
        right_mouth = (float(x + w * 0.65), float(y + h * 0.75))

        image_points = np.array([
            nose_center,
            chin_center,
            left_eye_center,
            right_eye_center,
            left_mouth,
            right_mouth
        ], dtype=np.float64)

        # Approximate camera matrix K
        focal_length = img_w
        center = (img_w / 2, img_h / 2)
        camera_matrix = np.array([
            [focal_length, 0, center[0]],
            [0, focal_length, center[1]],
            [0, 0, 1]
        ], dtype=np.float64)

        dist_coeffs = np.zeros((4, 1), dtype=np.float64)

        # Solve Perspective-n-Point
        success, rotation_vector, translation_vector = cv2.solvePnP(
            self.model_points,
            image_points,
            camera_matrix,
            dist_coeffs,
            flags=cv2.SOLVEPNP_ITERATIVE
        )

        if not success:
            return {
                "yaw": 0.0,
                "pitch": 0.0,
                "roll": 0.0,
                "is_looking_away": False,
                "gaze_direction": "CENTER",
                "confidence": 0.5,
            }

        # Convert rotation vector to rotation matrix
        rotation_matrix, _ = cv2.Rodrigues(rotation_vector)

        # Extract continuous Euler angles
        # Using RQ decomposition or trigonometry
        proj_matrix = np.hstack((rotation_matrix, translation_vector))
        _, _, _, _, _, _, euler_angles = cv2.decomposeProjectionMatrix(proj_matrix)

        pitch = float(euler_angles[0][0])
        yaw = float(euler_angles[1][0])
        roll = float(euler_angles[2][0])

        # Normalize yaw around center using asymmetry offset if available
        if abs(horizontal_offset) > 0.15:
            yaw = yaw + (horizontal_offset * 30.0)

        yaw = round(float(np.clip(yaw, -90.0, 90.0)), 1)
        pitch = round(float(np.clip(pitch, -90.0, 90.0)), 1)
        roll = round(float(np.clip(roll, -90.0, 90.0)), 1)

        is_looking_away = abs(yaw) > self.yaw_threshold or abs(pitch) > self.pitch_threshold

        gaze_direction = "CENTER"
        if yaw > self.yaw_threshold:
            gaze_direction = "RIGHT"
        elif yaw < -self.yaw_threshold:
            gaze_direction = "LEFT"
        elif pitch > self.pitch_threshold:
            gaze_direction = "DOWN"
        elif pitch < -self.pitch_threshold:
            gaze_direction = "UP"

        confidence = 0.85 if len(eyes) >= 2 else 0.70

        return {
            "yaw": yaw,
            "pitch": pitch,
            "roll": roll,
            "is_looking_away": is_looking_away,
            "gaze_direction": gaze_direction,
            "confidence": confidence,
        }
