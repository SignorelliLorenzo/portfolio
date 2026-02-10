# Basket-AI: Building a Low-Cost Basketball Tracking System with AI

*Author: Lorenzo Signorelli*

---

## Introduction & Project Vision

Professional basketball leagues like the NBA utilize advanced tracking systems that combine multiple high-resolution cameras, proprietary sensors, and complex data pipelines. These systems provide unparalleled insights into player movement, ball physics, and team tactics. However, with costs reaching hundreds of thousands of euros, this technology remains inaccessible for most national federations and smaller clubs.

In Italy, game analysis is still predominantly manual. Coaches and analysts spend countless hours reviewing game footage to extract basic statistics and tactical patterns—a time-consuming and subjective process.

**Basket-AI** emerged as a research initiative with a clear, ambitious goal: to develop an affordable, AI-powered alternative that automates the most repetitive aspects of game analysis. The system is designed not to replace coaches, but to empower them with automated data extraction, reducing their manual workload and providing objective insights.

---

## System Architecture & Technical Deep Dive

### 1. Player Detection
**Objective:** Reliably identify and locate all players on the court in every frame.  
*   **Model:** YOLOv11 (nano variant for speed/accuracy balance).  
*   **Training Data:** Custom dataset of ~1,500 manually annotated images.  
*   **Camera Setup:** Two static cameras mounted overhead on opposite sides of the court. This top-down perspective was chosen to minimize player occlusions compared to a ground-level view.  
*   **Result:** The fine-tuned model achieved stable and precise player bounding box detection across various lighting conditions and game phases.  

![Player_Tracking](/projects/basket-ai/assets/88_labeled_top_corrected.png)

---

### 2. Ball Detection
**Objective:** Track the small, fast-moving basketball with high consistency.  
*   **Challenge:** The ball is a small object that moves at high velocity and is often occluded by players' hands or bodies.  
*   **Model:** A separate, specialized YOLO model trained specifically on ball instances.  
*   **Training Data:** Dataset enriched with images focusing on ball during passes, shots, and dribbles.  
*   **Result:** The model successfully localized the ball in most frames, though occasional drops occurred during heavy occlusions or motion blur.  

---

### 3. Team Identification (Player Segmentation & Clustering)
**Objective:** Assign each detected player to their correct team based on jersey color.  
*   **Initial Challenge:** Simple color clustering (K-Means) on the raw player crop was highly sensitive to background colors from the court, stands, and shadows, leading to misclassifications.  
*   **Solution: A Two-Step Pipeline**
    1.  **Precise Segmentation:** Used the Segment Anything Model (SAM2), prompted by the YOLO bounding boxes, to generate precise pixel-level masks for each player. This effectively removed the background, leaving only the player and their jersey.  
    2.  **Robust Clustering:** Applied K-Means clustering on the dominant color channels (e.g., in HSV color space) extracted from the segmented player images. This was combined with color histogram comparisons to improve separation.  
*   **Enhancement:** When the jersey colors for both teams were known beforehand (e.g., "white" vs. "blue"), the clustering process was guided by this information, significantly boosting accuracy and reliability.  

<img
  src="/projects/basket-ai/assets/teams.gif"
  alt="Team assignment pipeline demo"
  class="w-full rounded-xl border border-neutral-800/40 shadow-lg my-6"
/>

---

### 4. Jersey Number Recognition
**Objective:** Identify the jersey number of a player to assign a unique identity, a critical step before tracking.  
*   **Core Problem:** Off-the-shelf OCR models like PARSeq perform poorly on jersey numbers without precise localization due to unusual fonts, folds in the fabric, and motion blur.  
*   **Developed Pipeline:**
    1.  **Localization:** Trained a custom YOLO model to detect the specific region of the jersey where the number is located (e.g., upper back). This acted as a high-quality region proposer.  
    2.  **Recognition:** Cropped the proposed region and passed it to the PARSeq model for actual digit recognition.  
*   **Performance:** Achieved **79% accuracy** on a challenging test set of 131 images where the number was at least partially visible.  

![Team_tracking](/projects/basket-ai/assets/grafico.png)

---

### 5. Multi-Object Tracking (MOT) - The Core Challenge  
**Objective:** Maintain a consistent identity (ID) for each player and the ball across the entire video sequence.  

*   **Model Tested:** ByteTrack, which combines motion prediction (Kalman Filter) with appearance similarity matching to link detections across frames.  
*   **Primary Obstacles:**  
    *   **Visual Similarity:** From an overhead view, players on the same team look nearly identical, offering little for appearance-based models to distinguish.  
    *   **Occlusions & Motion:** Frequent collisions and rapid direction changes often broke the Kalman Filter’s motion assumptions.  
*   **Result:** The tracker experienced frequent **ID switches** (a player’s identity changing mid-play) and track fragmentation. This made the outputs unreliable for downstream analysis. With stronger ReID models and a camera angle that captures more distinctive body features, tracking performance could improve.  
*   **Current Outlook:** Our first implementation was unstable, and due to the **lack of sufficient resources (hardware, camera setup, and model fine-tuning), the client decided to discontinue the project**. While newer trackers integrated into frameworks like Ultralytics could improve results, achieving **unsupervised, robust MOT** in a visually homogeneous sports environment remains an open challenge.  

---

> **Note:** Since the client decided to stop MOT development due to missing resources, follow-up tasks such as pose estimation could not be initiated. MOT was a crucial part of the project and needed to be sorted out first.  

---

### 6. Pose Estimation *(Not Initiated)*  
**Objective:** Estimate the skeletal pose of each player to analyze movements such as jumps, defensive stances, and shooting form.  

*   **Status:** This task was never started. Since the MOT system itself required significantly more resources — and was ultimately discontinued by the client — pose estimation was postponed until a reliable tracking pipeline could be established.  
*   **Potential Solution:** Once MOT becomes feasible, lightweight models like YOLO-Pose could be fine-tuned for this task.  

<p align="center">  
  <img src="/projects/basket-ai/assets/pose.webp" alt="Pose Estimation" width="500" style="margin-bottom:5px"/>  
  <em>Source: <a href="https://posetrack.net/">PoseTrack</a></em>  
</p>  

---

## Results & Performance Overview

<table>
  <thead>
    <tr>
      <th>Task</th>
      <th>Methodology</th>
      <th>Outcome & Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Player Detection</td>
      <td>Fine-tuned YOLOv11</td>
      <td><strong>Stable.</strong> High recall and precision in overhead view.</td>
    </tr>
    <tr>
      <td>Ball Detection</td>
      <td>Specialized YOLO model</td>
      <td><strong>Good.</strong> Reliable but can drop during extreme occlusion or blur.</td>
    </tr>
    <tr>
      <td>Team Identification</td>
      <td>SAM2 + K-Means + Color Histograms</td>
      <td><strong>Robust.</strong> Highly dependent on successful background removal.</td>
    </tr>
    <tr>
      <td>Number Recognition</td>
      <td>YOLO (Localization) + PARSeq (OCR)</td>
      <td><strong>79% Accuracy.</strong> Effective on visible numbers.</td>
    </tr>
    <tr>
      <td>Pose Estimation</td>
      <td>OpenPose / YOLO-NAS Pose</td>
      <td><strong>Not Implemented.</strong> Project suspended.</td>
    </tr>
    <tr>
      <td>Multi-Object Tracking</td>
      <td>ByteTrack</td>
      <td><strong>Unstable.</strong> ID switches are frequent due to visual similarity from top-down. Fixes expensive.</td>
    </tr>
  </tbody>
</table>

---

## Conclusion & Future Perspectives

The Basket-AI project successfully demonstrated that core components of a professional basketball tracking system can be replicated using modern computer vision and AI at a fraction of the cost. We built a robust pipeline for **player detection, ball localization, team assignment, and jersey number recognition.**

The primary hurdle, and the reason for the project's pause, was **Multi-Object Tracking (MOT)**. From this challenge, a broader insight emerged: the future of practical computer vision lies in solving robust, long-term MOT. Reliable MOT is the key that unlocks the transition from simple frame-by-frame detection to true **temporal understanding**:

*   **In Sports:** Analyzing full plays, calculating player travel distance, and measuring team formation dynamics.  
*   **In Autonomous Driving:** Tracking vehicles and pedestrians across time to predict trajectories.  
*   **In Security & Retail:** Monitoring customer flow and behavior in a store over a complete session.  

Solving MOT would democratize these advanced analytics, making them accessible without the need for the vast resources of large corporations or elite leagues. While Basket-AI is currently paused, it serves as a foundational proof-of-concept and a clear map toward the future of affordable, AI-powered sports analytics.
