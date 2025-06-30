from typing import List

class SkillsDatabase:
    """Centralized skills database"""
    
    @staticmethod
    def get_skills() -> List[str]:
        """Load predefined skills database"""
        return [
            # Programming Languages
            "Python", "Java", "JavaScript", "C++", "C#", "Ruby", "PHP", "Go", "Rust", "Swift",
            "Kotlin", "Scala", "R", "MATLAB", "SQL", "HTML", "CSS", "TypeScript", "ABAP",
            "Perl", "PowerShell", "Bash", "Shell", "VBA", "Objective-C", "Dart", "Lua",
            
            # Frameworks & Libraries
            "React", "Angular", "Vue.js", "Node.js", "Django", "Flask", "Spring", "Laravel",
            "Express.js", "Redux", "jQuery", "Bootstrap", "Tailwind CSS", "Next.js", "Nuxt.js",
            "Svelte", "Ember.js", "Backbone.js", "ASP.NET", "Spring Boot", "Hibernate",
            
            # Databases
            "MySQL", "PostgreSQL", "MongoDB", "Oracle", "SQLite", "Redis", "Cassandra",
            "DynamoDB", "Firebase", "Elasticsearch", "Neo4j", "CouchDB", "MariaDB",
            
            # Cloud & DevOps
            "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Jenkins", "Git",
            "GitHub", "GitLab", "CI/CD", "Terraform", "Ansible", "Chef", "Puppet",
            "Vagrant", "Prometheus", "Grafana", "ELK Stack", "Nginx", "Apache",
            
            # Data Science & ML
            "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Pandas",
            "NumPy", "Scikit-learn", "Matplotlib", "Seaborn", "Jupyter", "Keras",
            "OpenCV", "NLTK", "Spark", "Hadoop", "Tableau", "Power BI",
            
            # Mobile Development
            "iOS", "Android", "React Native", "Flutter", "Xamarin", "Ionic",
            
            # Testing
            "Jest", "Selenium", "Cypress", "JUnit", "PyTest", "Mocha", "Chai",
            
            # Soft Skills
            "Leadership", "Communication", "Problem Solving", "Team Work", "Project Management",
            "Analytical Thinking", "Creativity", "Adaptability", "Time Management", "Critical Thinking"
        ]
    
    @staticmethod
    def add_skill(skill: str) -> None:
        """Add new skill to database (for future expansion)"""
        # Implementation for dynamic skill addition
        pass
    
    @staticmethod
    def search_skills(query: str) -> List[str]:
        """Search for skills matching query"""
        skills = SkillsDatabase.get_skills()
        query_lower = query.lower()
        return [skill for skill in skills if query_lower in skill.lower()]