# Computer Vision Engine Specification & Algorithms

## 1. Overview
The **Computer Vision Engine (`cv_engine`)** is an independent, modular sub-system responsible for analyzing live webcam frames captured during an examination session. It evaluates four core dimensions:
1. **Face Presence & Count**: Verifies single-student presence; detects absence and secondary individuals.
2. **Head Pose 3D Estimation**: Computes 3-axis Euler angles (Yaw, Pitch, Roll) using 3D facial geometry.
3. **Restricted Object Detection**: Identifies mobile phones, tablets, or books using YOLOv8.
4. **Temporal Anti-Spam Filtering**: Employs sliding-window hysteresis to prevent false alarms from brief glances or natural gestures.

---

## 2. Detection Modules & Mathematical Formulations

### 2.1 Head Pose Estimation via Perspective-n-Point (`solvePnP`)
Rather than relying on 2D heuristics, the engine utilizes a standard 3D anthropometric face model mapped to 2D facial landmarks obtained from **MediaPipe Face Mesh** (468 landmarks).

#### Key 3D Facial Landmarks (Generic Human Face Model):
- Nose Tip: Index 1 (`[0.0, 0.0, 0.0]`)
- Chin: Index 152 (`[0.0, -330.0, -65.0]`)
- Left Eye Outer Corner: Index 33 (`[-225.0, 170.0, -135.0]`)
- Right Eye Outer Corner: Index 263 (`[225.0, 170.0, -135.0]`)
- Left Mouth Corner: Index 61 (`[-150.0, -150.0, -125.0]`)
- Right Mouth Corner: Index 291 (`[150.0, -150.0, -125.0]`)

#### Camera Matrix Estimation:
Given frame width $W$ and height $H$, the focal length $f$ is estimated as $f = W$, with optical center at $(c_x, c_y) = (W/2, H/2)$:

$$\mathbf{K} = \begin{bmatrix} f & 0 & c_x \\ 0 & f & c_y \\ 0 & 0 & 1 \end{bmatrix}$$

Using OpenCV's `cv2.solvePnP` with `cv2.SOLVEPNP_ITERATIVE`, the rotation vector $\mathbf{r}$ and translation vector $\mathbf{t}$ are computed. The rotation matrix $\mathbf{R}$ is retrieved via `cv2.Rodrigues(\mathbf{r})`, from which continuous Euler angles are calculated:

$$\theta_{\text{pitch}} = \arcsin(-R_{20})$$
$$\theta_{\text{yaw}} = \arctan2(R_{21}, R_{22})$$
$$\theta_{\text{roll}} = \arctan2(R_{10}, R_{00})$$

#### Decision Boundaries:
- $|\theta_{\text{yaw}}| > 25.0^\circ$: Candidate looking away (left or right).
- $\theta_{\text{pitch}} < -18.0^\circ$ or $\theta_{\text{pitch}} > 22.0^\circ$: Candidate looking up or down.

---

### 2.2 Face Count & Absence Detection
- **Extractor**: MediaPipe Face Detection / Face Mesh.
- **Single Person State**: Exact count = 1.
- **Multiple Person State**: If count $> 1$ with confidence $> 0.60$, candidate `MULTIPLE_PERSONS` event is emitted.
- **Absence State**: If count $= 0$ across consecutive frames, candidate `ABSENCE` event is emitted.

---

### 2.3 Object Detection (Restricted Items)
- **Model**: Ultralytics YOLOv8n (optimized for real-time edge/server CPU inference at 30+ FPS).
- **Target Classes**:
  - `cell phone` (COCO Class ID: 67)
  - `book` (COCO Class ID: 73)
  - `laptop` (COCO Class ID: 63)
- **Confidence Threshold**: $\ge 0.55$.
- Bounding boxes and labels are tagged directly on the evidence snapshot.

---

## 3. Temporal Anti-Spam State Machine (Hysteresis Filter)

Single-frame anomalies are common due to normal bodily motion, eye blinking, or sensor noise. The `TemporalAnalyzer` buffers frame states over a sliding time window $\Delta t$:

| Incident Type | Trigger Condition | Persistence Required ($\tau$) | Cooldown Period | Severity |
| :--- | :--- | :--- | :--- | :--- |
| **Looking Away** | $\|\theta_{\text{yaw}}\| > 25^\circ$ or $\|\theta_{\text{pitch}}\| > 20^\circ$ | $\ge 3.0$ seconds | 5.0 seconds | Medium |
| **Student Absence** | Face count = 0 | $\ge 3.0$ seconds | 5.0 seconds | High |
| **Multiple Persons**| Face count $\ge 2$ | $\ge 1.5$ seconds | 5.0 seconds | High |
| **Mobile Phone** | YOLO class 67 confidence $\ge 0.55$ | $\ge 1.0$ second | 5.0 seconds | Critical |

### State Transition:
1. `NORMAL`: Examinee within compliant thresholds.
2. `PENDING_ANOMALY`: Condition met at time $t_0$; timer starts.
3. If condition resolves before $t_0 + \tau$, counter resets to 0 (No false alert).
4. `FLAGGED_INCIDENT`: If condition sustains until $t_0 + \tau$, the event is committed to the database, an evidence snapshot is captured, and an alert is broadcast to administrators.
5. `COOLDOWN`: Prevents duplicate records for the same continuous action.
