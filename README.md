# AquaWiki

Nền tảng web tiếng Việt cho người chơi cá cảnh: tra cứu loài, mô phỏng hồ (bioload + tương thích), quản lý bể & nhắc lịch thay nước, và **nhận diện loài cá bằng ảnh** (AI – Fishial.AI).

* **Backend:** Java 21 · Spring Boot 3.5 · Spring Security (JWT) · MySQL 8 · Flyway
* **Frontend:** React + TypeScript · Vite · TailwindCSS
* **AI nhận diện cá:** Fishial.AI Cloud API v2 (qua interface `SpeciesRecognitionService`, có thể đổi provider)