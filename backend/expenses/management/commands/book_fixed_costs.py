from django.core.management.base import BaseCommand

from expenses.models import generate_due_expenses


class Command(BaseCommand):
    help = 'Book fixed costs that have fallen due (also happens automatically when the Expenses page opens).'

    def handle(self, *args, **options):
        self.stdout.write(f'{generate_due_expenses()} expense(s) booked.')
