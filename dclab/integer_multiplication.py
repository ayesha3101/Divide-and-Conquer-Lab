import csv
import time
from pathlib import Path

def karatsuba(x, y, stats):
    """Multiply two non-negative integers using the Karatsuba divide-and-conquer method."""
    stats["recursive_calls"] += 1

    if x < 10 or y < 10:
        return x * y

    n = max(len(str(x)), len(str(y)))
    half = n // 2
    power = 10 ** half

    a, b = divmod(x, power)
    c, d = divmod(y, power)

    ac = karatsuba(a, c, stats)
    bd = karatsuba(b, d, stats)
    ab_cd = karatsuba(a + b, c + d, stats)

    return ac * (power ** 2) + (ab_cd - ac - bd) * power + bd


def process_file(file_path):
    lines = Path(file_path).read_text().strip().splitlines()
    if len(lines) < 2:
        raise ValueError(f"{file_path} must contain two integers.")

    first = int(lines[0].strip())
    second = int(lines[1].strip())

    stats = {"recursive_calls": 0}
    start = time.perf_counter()
    product = karatsuba(first, second, stats)
    elapsed = time.perf_counter() - start

    # Check the answer against Python's built-in multiplication.
    correct = product == first * second

    return {
        "file": Path(file_path).name,
        "digits_a": len(lines[0].strip()),
        "digits_b": len(lines[1].strip()),
        "execution_time_seconds": elapsed,
        "recursive_calls": stats["recursive_calls"],
        "correct": correct,
        "product": product
    }


def main():
    input_folder = Path(__file__).parent / "input_files"
    output_folder = Path(__file__).parent / "results"
    output_folder.mkdir(exist_ok=True)

    results = []
    for file_path in sorted(input_folder.glob("*.txt")):
        result = process_file(file_path)
        results.append(result)
        (output_folder / f"{file_path.stem}_result.txt").write_text(
            f"Input file: {result['file']}\n"
            f"Digits in first number: {result['digits_a']}\n"
            f"Digits in second number: {result['digits_b']}\n"
            f"Execution time (seconds): {result['execution_time_seconds']:.8f}\n"
            f"Recursive calls: {result['recursive_calls']}\n"
            f"Correct result: {result['correct']}\n\n"
            f"Product:\n{result['product']}\n"
        )

    summary_path = output_folder / "summary.csv"
    with summary_path.open("w", newline="") as csv_file:
        writer = csv.DictWriter(
            csv_file,
            fieldnames=[
                "file", "digits_a", "digits_b",
                "execution_time_seconds", "recursive_calls", "correct"
            ]
        )
        writer.writeheader()
        for result in results:
            writer.writerow({key: result[key] for key in writer.fieldnames})
    
    
    member3_path = output_folder / "results_for_member3.txt"

    with member3_path.open("w", encoding="utf-8") as file:
        file.write("INTEGER MULTIPLICATION - EXECUTION SUMMARY\n")
        file.write("Algorithm: Karatsuba Divide and Conquer\n\n")

        file.write(
            f"{'File':<14}{'Digits A':>10}{'Digits B':>10}"
            f"{'Time (sec)':>16}{'Calls':>10}{'Correct':>10}\n"
        )

        for result in results:
            file.write(
                f"{result['file']:<14}"
                f"{result['digits_a']:>10}"
                f"{result['digits_b']:>10}"
                f"{result['execution_time_seconds']:>16.8f}"
                f"{result['recursive_calls']:>10}"
                f"{str(result['correct']):>10}\n"
            )

        file.write("\nAll multiplication results were verified.\n")
        file.write("Execution times may vary between computers.\n")



    print("INTEGER MULTIPLICATION RESULTS")
    print("-" * 86)
    print(f"{'File':<14}{'Digits A':>12}{'Digits B':>12}{'Time (sec)':>18}{'Calls':>12}{'Correct':>12}")
    for result in results:
        print(
            f"{result['file']:<14}{result['digits_a']:>12}"
            f"{result['digits_b']:>12}{result['execution_time_seconds']:>18.8f}"
            f"{result['recursive_calls']:>12}{str(result['correct']):>12}"
        )
    print(f"\nSummary saved to: {summary_path}")


if __name__ == "__main__":
    main()
