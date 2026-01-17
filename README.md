# 🧠 Titanic: Correlation and Cross-Tabulation Analysis

This project performs an **Exploratory Data Analysis (EDA)** on the classic **Titanic dataset**, focusing on the study of relationships between categorical variables through **visual correlation** and **cross-tabulation** techniques.

The main goal is to understand how factors such as **social class**, **gender**, and **ticket fare** influenced **passenger survival**.

---

## 📊 Key Concepts

### 🔹 Visual Correlation
For categorical variables, a traditional numerical correlation coefficient is not appropriate.  
Instead, **heatmaps** are used to visualize patterns, proportions, and relationships between categories.

Applied examples:
- Survival proportion by passenger class.
- Average ticket fare (`Fare`) by class.

These visualizations help answer questions such as:
- Did passengers in higher classes have a greater chance of survival?
- Is ticket price directly related to social class?

---

### 🔹 Cross-Tabulation (Crosstab)
Cross-tabulation summarizes the relationship between two or more categorical variables using contingency tables.

The project uses `pd.crosstab()` from **pandas** to:
- Count occurrences across category combinations.
- Calculate proportions and survival rates.
- Create graphical representations such as heatmaps and bar charts.

Examples:
- Gender vs. Survival.
- Class vs. Gender.
- Survival rate by Class and Gender.

---

## 🗂️ Dataset

- **Source:** Titanic Dataset (CSV)
- **Features used:**
  - `Survived`
  - `Pclass`
  - `Sex`
  - `Age`
  - `Fare`

Column names are normalized and the data is cleaned before analysis.

---

## 🛠️ Technologies Used

- **Python**
- **Pandas** – data manipulation
- **NumPy** – numerical support
- **Seaborn** – statistical visualization
- **Matplotlib** – plotting

---

## 🔥 Analysis Performed

### ✔ Heatmaps
- Class vs. Survival (proportion-based)
- Class vs. Average Ticket Fare

### ✔ Cross-Tabulations
- Gender vs. Survival (counts)
- Class vs. Gender
- Survival Rate (%) by Class and Gender

---

## 🧾 Conclusions

- **Women** had a higher survival rate than men.
- Passengers in **1st and 2nd class** survived more often than those in 3rd class.
- **3rd class men** had the lowest probability of survival.

👉 Passenger survival on the Titanic was strongly influenced by **gender** and **social class**.

---

## 📌 Author


Camilo Coronado  

---
