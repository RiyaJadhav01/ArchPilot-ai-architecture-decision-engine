import yaml
from pathlib import Path
from typing import Dict, Any

def load_architecture_rules() -> Dict[str, Any]:
    # Look for architectures.yaml in the root rules/ directory
    rules_path = Path(__file__).resolve().parent.parent.parent.parent / "rules" / "architectures.yaml"
    
    if not rules_path.exists():
        # Fallback path check depending on execution context
        rules_path = Path("rules/architectures.yaml")

    if not rules_path.exists():
        raise FileNotFoundError(f"Could not find architectures.yaml at {rules_path}")

    with open(rules_path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
        return data