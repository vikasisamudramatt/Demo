"""
Example Python module to demonstrate automatic code review
"""


def calculate_average(numbers):
    """Calculate the average of a list of numbers"""
    # FIXME: Handle empty list
    total = sum(numbers)
    count = len(numbers)
    return total / count


def greet_user(name):
    """Greet a user by name"""
    message = f"Hello, {name}!"
    return message


if __name__ == "__main__":
    # Example usage
    nums = [1, 2, 3, 4, 5]
    avg = calculate_average(nums)
    print(f"Average: {avg}")

    user = "Alice"
    greeting = greet_user(user)
    print(greeting)
