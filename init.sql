-- Appraisals Table
CREATE TABLE IF NOT EXISTS appraisals (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(7) NOT NULL,
    employee_name VARCHAR(30) NOT NULL,
    position VARCHAR(30) NOT NULL,
    department VARCHAR(50) NOT NULL,
    appraisal_date DATE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    strengths TEXT NOT NULL,
    improvements TEXT NOT NULL,
    comments TEXT,
    CONSTRAINT unique_employee_date UNIQUE (employee_id, appraisal_date)
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(7) NOT NULL,
    employee_name VARCHAR(30) NOT NULL,
    department VARCHAR(50) NOT NULL,
    role VARCHAR(30) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    review_date DATE NOT NULL
);

-- Sample data for appraisals
INSERT INTO appraisals (employee_id, employee_name, position, department, appraisal_date, rating, strengths, improvements, comments)
VALUES 
('ATS0123', 'Raghava', 'Junior Developer', 'IT', '2023-05-15', 4, 'Excellent technical skills, strong team player', 'Could improve time estimation for tasks', ''),
('ATS0456', 'Ajay', 'Java Developer', 'Software Developer', '2023-06-20', 5, 'Creative campaigns, great leadership', 'Needs to delegate more effectively', ''),
('ATS0789', 'Ilyas', 'HR Specialist', 'HR', '2023-07-10', 4, 'Strong interpersonal skills, reliable', 'Could enhance recruitment strategies', ''),
('ATS0124', 'Pavan', 'Financial Analyst', 'Finance', '2023-04-05', 3, 'Attention to detail, reliable', 'Should speak up more in meetings', '');

-- Sample data for reviews
INSERT INTO reviews (employee_id, employee_name, department, role, rating, review_text, review_date)
VALUES 
('ATS0125', 'Shravan Reddy', 'Developer', 'Senior Software Engineer', 4, 'He has shown excellent problem-solving skills and dedication.', '2023-08-01'),
('ATS0789', 'Ilyas Zubair', 'HR', 'HR Manager', 4, 'He is a great team player and handles employee relations effectively.', '2023-08-02'),
('ATS0345', 'Srikant Nalla', 'Manager', 'Project Manager', 5, 'He is a strong leader and ensures timely project delivery.', '2023-08-03'),
('ATS0678', 'Jay Simha', 'Manager', 'Manager', 5, 'He is a strong leader and ensures timely project delivery.', '2023-08-04');