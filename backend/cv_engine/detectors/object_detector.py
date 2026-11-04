import os
import cv2
import numpy as np
from typing import List, Dict, Any, Optional
from ultralytics import YOLO

class ObjectDetector:
    """
    Prohibited Object & Device Detector powered by Ultralytics YOLOv8.
    Targets mobile phones, secondary laptops, and study materials in the exam workspace.
    """
    # Prohibited COCO class IDs:
    # 67: cell phone, 63: laptop, 73: book, 0: person
    TARGET_CLASSES = {
        67: "cell phone",
        63: "laptop",
        73: "book",
        0: "person",
    }

    def __init__(
        self,
        model_path: Optional[str] = None,
        conf_threshold: float = 0.50
    ):
        if model_path is None or not os.path.exists(model_path):
            # Check models directory or default to yolov8n.pt
            default_path = os.path.join(os.path.dirname(__file__), "..", "models", "yolov8n.pt")
            if os.path.exists(default_path):
                model_path = default_path
            else:
                model_path = "yolov8n.pt"

        self.model = YOLO(model_path)
        self.conf_threshold = conf_threshold

    def detect(self, frame: np.ndarray) -> Dict[str, Any]:
        """
        Runs YOLO inference on a BGR frame and filters for prohibited examination objects.
        """
        if frame is None or frame.size == 0:
            return {
                "detected_objects": [],
                "has_prohibited_item": False,
                "has_cell_phone": False,
                "person_count": 0,
            }

        # Run inference on CPU/GPU
        results = self.model.predict(
            source=frame,
            conf=self.conf_threshold,
            classes=list(self.TARGET_CLASSES.keys()),
            verbose=False,
        )

        detected_objects = []
        has_cell_phone = False
        has_prohibited_item = False
        person_count = 0

        if len(results) > 0 and results[0].boxes is not None:
            boxes = results[0].boxes
            for i in range(len(boxes)):
                cls_id = int(boxes.cls[i].item())
                confidence = float(boxes.conf[i].item())
                xyxy = [int(v) for v in boxes.xyxy[i].tolist()]

                label = self.TARGET_CLASSES.get(cls_id, f"class_{cls_id}")

                if cls_id == 0:
                    person_count += 1
                elif cls_id == 67:
                    has_cell_phone = True
                    has_prohibited_item = True
                elif cls_id in (63, 73):
                    has_prohibited_item = True

                detected_objects.append({
                    "class_id": cls_id,
                    "label": label,
                    "confidence": round(confidence, 3),
                    "bbox": xyxy, # [x1, y1, x2, y2]
                })

        return {
            "detected_objects": detected_objects,
            "has_prohibited_item": has_prohibited_item,
            "has_cell_phone": has_cell_phone,
            "person_count": person_count,
        }
