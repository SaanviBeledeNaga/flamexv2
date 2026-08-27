.PHONY: setup demo train test run-backend run-frontend docker-up docker-down

setup:
	pip install -r backend/requirements.txt

demo:
	python -c "import sys; sys.path.append('.'); from scripts.generate_demo_data import generate_demo_dataset; generate_demo_dataset()"

train:
	python -m backend.app.ml.train

evaluate:
	python -m backend.app.ml.evaluate

test:
	pytest backend/tests

run-backend:
	uvicorn backend.app.main:app --reload --port 8000

run-frontend:
	cd frontend && npm run dev

docker-up:
	docker-compose up -d --build

docker-down:
	docker-compose down
