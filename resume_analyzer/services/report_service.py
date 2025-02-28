import datetime
import statistics
from collections import Counter
from services.file_service import load_results

class ReportService:
    def generate_detailed_report(self, result):
        """Generate a detailed text report of the analysis"""
        report = []
        report.append("=" * 50)
        report.append(f"RESUME ANALYSIS REPORT: {result['filename']}")
        report.append("=" * 50)
        report.append(f"Date: {result['last_checked']}")
        report.append(f"Overall ATS Score: {result['result']['score']}/100")
        report.append("\nBREAKDOWN:")
        
        for component, score in result['result'].get('component_scores', {}).items():
            report.append(f"- {component.replace('_', ' ').title()}: {score}/100")
        
        report.append("\nKEY FINDINGS:")
        for message in result['result']['messages']:
            report.append(f"- {message}")
            
        if result['result']['sections_missing']:
            report.append("\nMISSING SECTIONS:")
            for section in result['result']['sections_missing']:
                report.append(f"- {section}")
                
        if result['result']['formatting_issues']:
            report.append("\nFORMATTING ISSUES:")
            for issue in result['result']['formatting_issues']:
                report.append(f"- {issue}")
                
        report.append("\nRECOMMENDATIONS:")
        for rec in result['result']['recommendations']:
            report.append(f"- {rec}")
            
        return "\n".join(report)
        
    def generate_stats_report(self):
        """Generate aggregate statistics across all analyzed resumes"""
        results = load_results()
        
        if not results:
            return None
            
        scores = []
        word_counts = []
        industry_counts = {}
        common_issues = Counter()
        
        for file_id, data in results.items():
            if 'result' in data:
                result = data['result']
                scores.append(result.get('score', 0))
                word_counts.append(result.get('word_count', 0))
                
                industry = result.get('industry')
                if industry:
                    industry_counts[industry] = industry_counts.get(industry, 0) + 1
                
                # Count common issues
                for rec in result.get('recommendations', []):
                    common_issues[rec] += 1
        
        stats = {
            "total_resumes": len(results),
            "score_metrics": {
                "average": statistics.mean(scores) if scores else 0,
                "median": statistics.median(scores) if scores else 0,
                "min": min(scores) if scores else 0,
                "max": max(scores) if scores else 0
            },
            "word_count_metrics": {
                "average": int(statistics.mean(word_counts)) if word_counts else 0,
                "median": int(statistics.median(word_counts)) if word_counts else 0,
                "min": min(word_counts) if word_counts else 0,
                "max": max(word_counts) if word_counts else 0
            },
            "industry_distribution": industry_counts,
            "common_issues": {issue: count for issue, count in common_issues.most_common(5)}
        }
        
        return stats