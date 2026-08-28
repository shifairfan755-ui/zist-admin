import { useEffect, useState } from "react";
import {
  useParams,
  Link,
  useNavigate,
} from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function ViewApplication() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [app, setApp] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadApplication();
  }, [id]);

  const loadApplication =
    async () => {
      const {
        data,
        error,
      } = await supabase
        .from(
          "applications"
        )
        .select("*")
        .eq("id", id)
        .single();

      if (
        error ||
        !data
      ) {
        setLoading(false);
        return;
      }

      setApp(data);
      setLoading(false);
    };

  const deleteApplication =
    async () => {
      const yes =
        confirm(
          "Delete this application?"
        );

      if (!yes)
        return;

      await supabase
        .from(
          "applications"
        )
        .delete()
        .eq("id", id);

      navigate(
        "/applications"
      );
    };

  if (loading) {
    return (
      <div className="p-6 text-center text-lg font-semibold">
        Loading...
      </div>
    );
  }

  if (!app) {
    return (
      <div className="p-6 text-red-600">
        Application not found
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 max-w-6xl mx-auto">
      {/* Back */}
      <Link
        to="/applications"
        className="text-blue-600 text-sm font-medium"
      >
        ← Back to
        Applications
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl shadow p-5 md:p-8 mt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <p className="text-sm text-slate-500">
              Application #
              {
                app.application_no
              }
            </p>

            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mt-1">
              {
                app.applicant_name
              }
            </h1>

            <p className="text-slate-600 mt-1">
              {app.parentage
                ? `S/o ${app.parentage}`
                : "---"}
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
              <Badge>
                {
                  app.requested_for
                }
              </Badge>

              <Badge gray>
                {app.status ||
                  "Pending"}
              </Badge>
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full md:w-auto">
            <Link
              to={`/applications/edit/${app.id}`}
              className="px-5 py-3 rounded-xl bg-blue-600 text-white text-center hover:bg-blue-700"
            >
              Edit
            </Link>

            <button
              onClick={
                deleteApplication
              }
              className="px-5 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
        <Card title="Applicant Details">
          <Row
            label="Phone"
            value={
              app.phone
            }
          />

          <Row
            label="Address"
            value={
              app.address
            }
          />

          <Row
            label="Date"
            value={
              app.application_date
            }
          />
        </Card>

        <Card title="Request Details">
          <Row
            label="Requested For"
            value={
              app.requested_for
            }
          />

          <Row
            label="Amount Requested"
            value={
              app.amount_requested
                ? `₹${Number(
                    app.amount_requested
                  ).toLocaleString()}`
                : "---"
            }
          />

          <Row
            label="Status"
            value={
              app.status
            }
          />
        </Card>
      </div>

      {/* Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
        <Card title="Recommendation">
          <p className="text-slate-700 whitespace-pre-line">
            {app.recommendation ||
              "---"}
          </p>
        </Card>

        <Card title="Notes">
          <p className="text-slate-700 whitespace-pre-line">
            {app.notes ||
              "---"}
          </p>
        </Card>
      </div>

      {/* Document */}
      {app.document_url && (
        <div className="mt-5">
          <Card title="Supporting Document">
            <a
              href={
                app.document_url
              }
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 font-medium hover:underline"
            >
              Open Document
            </a>
          </Card>
        </div>
      )}
    </div>
  );
}

/* Components */

function Card({
  title,
  children,
}: any) {
  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">
        {title}
      </h2>

      {children}
    </div>
  );
}

function Row({
  label,
  value,
}: any) {
  return (
    <div className="flex justify-between gap-4 border-b pb-3 mb-3 last:border-none last:pb-0 last:mb-0">
      <span className="text-slate-500 text-sm">
        {label}
      </span>

      <span className="font-medium text-slate-800 text-right">
        {value ||
          "---"}
      </span>
    </div>
  );
}

function Badge({
  children,
  gray = false,
}: any) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        gray
          ? "bg-slate-100 text-slate-700"
          : "bg-blue-50 text-blue-700"
      }`}
    >
      {children}
    </span>
  );
}